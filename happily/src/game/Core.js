import Phaser from '../lib/phaser.js';
import Bottle from './Bottle.js';
import Button from './Button.js';

import Config from './Config.js';
import Consts from './Consts.js';
import Controls from './Controls.js';
import Door from './Door.js';
import Enums from './Enums.js';
import Helper from './Helper.js';
import Player from './Player.js';
import She from './She.js';
import Utils from './Utils.js';

export default class Core {

    /** @type {Phaser.Scene} */
    _scene;

    /** @type {Controls} */
    _controls;

    /** @type {Phaser.GameObjects.Text} */
    _debugText;

    /** @type {Player} */
    _player;

    /** @type {She} */
    _she;

    /** @type {Phaser.Tilemaps.Tilemap} */
    _level;

    /** @type {Set} */
    _collideTiles;

    /** @type {Button[]} */
    _buttons;

    /** @type {Door[]} */
    _doors;

    /** @type {Bottle[]} */
    _bottles;

    /** @type {Number} */
    _levelIndex;

    /** @type {Phaser.GameObjects.Image} */
    _bigBottle;

    /**
     * @param {Phaser.Scene} scene 
     */
    constructor(scene, levelIndex) {
        const me = this;

        me._scene = scene;

        me._levelIndex = levelIndex;

        // phaser

        // custom

        scene.add.image(
            Consts.Viewport.Width / 2,
            Consts.Viewport.Height / 2,
            'background')
            .setDepth(Consts.Depth.Background)
            .setScrollFactor(0);

        me._level = scene.make.tilemap({
            key: 'level0',
            tileWidth: Consts.Unit.Small,
            tileHeight: Consts.Unit.Small
        });

        const tileset = me._level.addTilesetImage('tiles');

        const tiles = me._level.createLayer(0, tileset)
            .setDepth(Consts.Depth.Background);

        me._controls = new Controls(scene.input);

        me._player = new Player(scene, 200, 690, me._level.heightInPixels);
        me._she = new She(scene, 100, 438, me._player);

        const config = Config.Levels[levelIndex];

        me._buttons = [];
        for (let i = 0; i < config.buttons.length; ++i) {
            const button = new Button(scene, config.buttons[i].x, config.buttons[i].y);
            me._buttons.push(button);
        };

        const doorGroup = scene.physics.add.staticGroup();
        me._doors = [];
        for (let i = 0; i < config.doors.length; ++i) {
            const door = new Door(doorGroup, config.doors[i].x, config.doors[i].y);
            me._doors.push(door);
        }

        me._bottles = [];
        for (let i = 0; i < config.bottles.length; ++i) {
            const bottle = new Bottle(scene, config.bottles[i].x, config.bottles[i].y);
            me._bottles.push(bottle);
        }

        me._bigBottle = scene.add.image(75, 725, 'big_bottle')
            .setAngle(-15)
            .setDepth(Consts.Depth.Foreground)
            .setScrollFactor(0)
            .setScale(0.75)
            .setVisible(false);

        // phaser

        scene.cameras.main
            .startFollow(me._player.toGameObject(), true, 0.9)
            .setBounds(0, 0, me._level.widthInPixels, me._level.heightInPixels);

        // physics

        me._collideTiles = new Set();
        for (let i = 0; i < Consts.CollideTiles.length; ++i) {
            const tile = Consts.CollideTiles[i];
            me._collideTiles.add(tile);
            me._level.setCollision(tile);
        }

        scene.physics.world.enable(me._player.toGameObject());

        scene.physics.add.collider(
            me._player.toGameObject(),
            tiles);

        scene.physics.add.collider(
            me._player.toGameObject(),
            doorGroup);

        // debug

        if (Config.Debug.Global && Config.Debug.Text) {
            me._debugText = scene.add.text(10, 10, 'DEBUG', { fontSize: 14, backgroundColor: '#000' })
                .setScrollFactor(0)
                .setDepth(Consts.Depth.Max);
        }
    }

    update() {
        const me = this;

        const status = me._player.update();
        me._controls.update();

        me._she.updateFlipX();

        if (me._she.state == Enums.SheState.FLY)
            me._processFly()
        else
            me._movePlayer();

        const player = Utils.toPoint(me._player.toGameObject());
        const she = Utils.toPoint(me._she.toGameObject());
        for (let i = 0; i < me._buttons.length; ++i) {
            const changed = me._buttons[i].check(player, she);
            if (changed) {
                const doors = Config.Levels[me._levelIndex].buttons[i].doors;
                for (let j = 0; j < doors.length; ++j) {
                    const door = me._doors[doors[j]];
                    me._buttons[i].isPressed
                        ? door.open()
                        : door.close();
                }
            }
        }

        if (!me._bigBottle.visible) {
            const bottle = Utils.firstOrNull(me._bottles, (b) => b.check(player));
            if (!!bottle)
                me._bigBottle.setVisible(true);
        }

        // debug

        if (Config.Debug.Global && Config.Debug.Text) {
            const text =
                `mse: ${me._scene.input.activePointer.worldX} ${me._scene.input.activePointer.worldY}\n` + 
                `plr: ${me._player._container.x | 0} ${me._player._container.y | 0}\n`+
                `lst: ${me._player.lastGround.pos.x | 0} ${me._player.lastGround.pos.y | 0}`;
            me._debugText.setText(text);
        }
    }

    _processFall() {
        const me = this;

        if (me._she.state == Enums.SheState.CATCH)
            return;

        const target = me._getSagePlayerTarget(me._player.lastGround.pos);

        me._she.catchPlayer(
            target,
            () => { me._player.disablePhysics() },
            () => { me._player.awake(); }
        );
    }

    _getSagePlayerTarget(pos) {
        const me = this;

        const left = me._level.getTileAtWorldXY(
            pos.x - Consts.Unit.PlayerWidth / 2,
            pos.y + 5 + Consts.Unit.PlayerHeight / 2);

        const right = me._level.getTileAtWorldXY(
            pos.x + Consts.Unit.PlayerWidth / 2,
            pos.y + 5 + Consts.Unit.PlayerHeight / 2);

        if (left && right)
            Utils.debugLog('left + right');
        else if (!!left)
            Utils.debugLog('left')
        else if (!!right)
            Utils.debugLog('right');

        if (!!left === !!right)
            return pos;

        if (left &&
            !me._isEmptyTile(left.x - 1, left.y) && 
            me._isEmptyTile(left.x - 1, left.y - 1) &&
            me._isEmptyTile(left.x - 1, left.y - 2) &&
            me._isEmptyTile(left.x, left.y - 1) &&
            me._isEmptyTile(left.x, left.y - 2)) {

                Utils.debugLog('shift left');
                return Utils.buildPoint(
                    me._level.tileToWorldX(left.x),
                    pos.y);
            }

        if (right &&
            !me._isEmptyTile(right.x + 1, right.y) && 
            me._isEmptyTile(right.x + 1, right.y - 1) &&
            me._isEmptyTile(right.x + 1, right.y - 2) &&
            me._isEmptyTile(right.x, right.y - 1) &&
            me._isEmptyTile(right.x, right.y - 2)) {

                Utils.debugLog('shift right');
                return Utils.buildPoint(
                    me._level.tileToWorldX(right.x + 1),
                    pos.y);
            }

        return pos;
    }

    _isEmptyTile(x, y) {
        const me = this;

        const tile = me._level.getTileAt(x, y);

        if (!tile)
            return true;

        const solid = me._collideTiles.has(tile.index);
        return !solid;
    }

    _processFly() {
        const me = this;

        if (!me._controls.isDown(Enums.Keyboard.JUMP)) {
            const target = me._getSagePlayerTarget(me._player.lastGround.pos)
            me._she.stopFly(target);
            me._player.awake();
            return;
        }

        const flyVelocity = me._she.getFlyVelocity();

        me._player.setVelocityY(flyVelocity);
        me._movePlayerX(true);

        const playerPos = Utils.toPoint(me._player.toGameObject());
        me._she.toGameObject().setPosition(playerPos.x, playerPos.y - 55);
    }

    _movePlayer() {
        const me = this;

        if (me._player.isBusy)
            return;

        if (me._controls.isDownOnce(Enums.Keyboard.JUMP)) {
            if (me._player.isGrounded())
                me._player.tryJump();
            else
                me._she.startFly(() => me._player.startFly());
        }

        me._movePlayerX(false);
    }

    _movePlayerX(fly) {
        const me = this;

        if (me._player.isBusy)
            return;

        let signX = 0;
        if (me._controls.isDown(Enums.Keyboard.LEFT))
            signX = -1;
        else if (me._controls.isDown(Enums.Keyboard.RIGHT))
            signX = 1;

        me._player.setVelocityX(signX, fly);
    }
}