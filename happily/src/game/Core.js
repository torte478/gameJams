import Phaser from '../lib/phaser.js';

import Config from './Config.js';
import Consts from './Consts.js';
import Controls from './Controls.js';
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

    /**
     * @param {Phaser.Scene} scene 
     */
    constructor(scene) {
        const me = this;

        me._scene = scene;

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