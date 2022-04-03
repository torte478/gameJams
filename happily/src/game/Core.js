import Phaser from '../lib/phaser.js';
import Bottle from './Bottle.js';
import Button from './Button.js';

import Config from './Config.js';
import Consts from './Consts.js';
import Controls from './Controls.js';
import Door from './Door.js';
import Enums from './Enums.js';
import Flame from './Flame.js';
import Target from './Target.js';
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

    /** @type {Phaser.GameObjects.Group} */
    _waves;

    /** @type {Flame[]} */
    _flames;

    /** @type {Target[]} */
    _targets;

    /** @type {Phaser.GameObjects.Image} */
    _fade;

    /** @type {Boolean} */
    _isRestarting;

    /** @type {Phaser.GameObjects.Text} */
    _hud;

    /** @type {Phaser.GameObjects.Sprite} */
    _restartButton;

    /** @type {Boolean} */
    _isDeath;

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

        const config = Config.Levels[levelIndex];

        me._level = scene.make.tilemap({
            key: config.tiles,
            tileWidth: Consts.Unit.Small,
            tileHeight: Consts.Unit.Small
        });

        const tileset = me._level.addTilesetImage('tiles');

        const tiles = me._level.createLayer(0, tileset)
            .setDepth(Consts.Depth.Background);

        me._controls = new Controls(scene.input);

        me._player = new Player(scene, config.playerX, config.playerY, me._level.heightInPixels);
        me._she = new She(scene, config.sheX, config.sheY, me._player);

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

        me._waves = scene.add.group();

        me._flames = [];
        const particles = scene.add.particles('fire');
        for (let i = 0; i < config.flame.length; ++i) {
            const flame = new Flame(
                scene, 
                config.flame[i].x, 
                config.flame[i].y, 
                config.flame[i].angle, 
                particles);
            me._flames.push(flame);
        }

        me._targets = [];
        for (let i = 0; i < config.targets.length; ++i) {
            const target = new Target(scene, config.targets[i].x, config.targets[i].y, config.targets[i].type);
            me._targets.push(target);
        }

        me._fade = scene.add.image(Consts.Viewport.Width / 2, Consts.Viewport.Height / 2, 'fade')
            .setScrollFactor(0)
            .setDepth(Consts.Depth.Max)
            .setVisible(false);

        me._isRestarting = false;

        me._hud = scene.add.text(985, 755, `0/${config.targets.length}`, { 
            fontFamily: 'Arial Black',
            fontSize: 74,
            color: '#FFE8FF'})
            .setOrigin(1, 0.5)
            .setStroke('#684976', 16)
            .setShadow(2, 2, '#333333', 2)
            .setScrollFactor(0)
            .setDepth(Consts.Depth.Foreground);

        me._restartButton = scene.add.sprite(55, 55, 'buttons', 0)
            .setInteractive()
            .setScrollFactor(0)
            .setDepth(Consts.Depth.Foreground)
            .on('pointerdown', () => { me._startRestart(Enums.GameResult.RESTART); })
            .on('pointermove', () => { me._restartButton.setFrame(1) })
            .on('pointerout', () => { me._restartButton.setFrame(0) });

        const startText = scene.add.text(-500, 300, `Level ${levelIndex + 1}/${Config.Levels.length}`, { 
            fontFamily: 'Arial Black',
            fontSize: 84,
            color: '#FFE8FF'})
            .setStroke('#684976', 16)
            .setShadow(2, 2, '#333333', 2)
            .setScrollFactor(0)
            .setDepth(Consts.Depth.Foreground);
        scene.tweens.timeline({
            targets: startText,
            onComplete: () => { startText.setVisible(false)},
            tweens: [
                {
                    x: 200,
                    duration: 500
                },
                {
                    x: 500,
                    duration: 1500
                },
                {
                    x: 1500,
                    duration: 500
                }
            ]
        });

        const ignoreMusic = Config.Debug.Global && Config.Debug.Music;
        if (!ignoreMusic)
            me._scene.sound.play('idle', { volume: 0.25, loop: true });

        me._isDeath = false;

        const textStyle = { 
            fontSize: 28, 
            color: '#000000', 
            align: 'center'
        };

        if (config.tiles == 'level0') {
            const text = 'Press Left/Right to move\n' +
                         'Press Z to jump';
            scene.add.text(150, 500, text, textStyle ).setDepth(Consts.Depth.Background);
            scene.add.text(650, 360, 'Press and hold Z after jump', textStyle ).setDepth(Consts.Depth.Background);
            scene.add.text(1260, 200, 'Use R or menu buttons\nto restart and exit', textStyle ).setDepth(Consts.Depth.Background);
        }

        if (config.tiles == 'level3') {
            scene.add.text(310, 480, 'Press X to drink', textStyle ).setDepth(Consts.Depth.Background);
        }

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
            me._debugText = scene.add.text(990, 10, 'DEBUG', { fontSize: 14, backgroundColor: '#000' })
                .setOrigin(1, 0)
                .setScrollFactor(0)
                .setDepth(Consts.Depth.Max);
        }
    }

    update() {
        const me = this;

        if (me._isRestarting || me._isDeath)
            return;

        const status = me._player.update();
        me._controls.update();

        if (me._controls.isDown(Enums.Keyboard.RESTART)) {
            me._startRestart(Enums.GameResult.RESTART);
            return;
        }

        me._she.updateFlipX();

        if (me._she.state == Enums.SheState.FLY)
            me._processFly()
        else if (status == Enums.PlayerStatus.GROUNDED 
                && me._bigBottle.visible 
                && me._controls.isDownOnce(Enums.Keyboard.ACTION))
            me._processBeer();
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

                    if (me._buttons[i].isPressed) {
                        door.open();
                        me._scene.sound.play('button_on', { volume: 0.5 });
                    } else {
                        door.close();
                        me._scene.sound.play('button_off', { volume: 0.25 });
                    }
                }
            }
        }

        if (!me._bigBottle.visible) {
            const bottle = Utils.firstOrNull(me._bottles, (b) => b.check(player));
            if (!!bottle) {
                me._bigBottle.setVisible(true);
                me._scene.sound.play('bottle', { volume: 0.5 });
            }
        }

        me._checkDeath(player);
        me._checkTargets(player);
        

        // debug

        if (Config.Debug.Global && Config.Debug.Text) {
            const text =
                `mse: ${me._scene.input.activePointer.worldX} ${me._scene.input.activePointer.worldY}\n` + 
                `plr: ${me._player._container.x | 0} ${me._player._container.y | 0}\n`+
                `lst: ${me._player.lastGround.pos.x | 0} ${me._player.lastGround.pos.y | 0}`;
            me._debugText.setText(text);
        }
    }

    _checkTargets(player) {
        const me = this;

        let changed = -1;
        for (let i = 0; i < me._targets.length; ++i) {
            const success = me._targets[i].checkComplete(player);

            if (success)
                changed = i;
        }

        if (changed == -1)
            return;

        me._scene.sound.play('target', { volume: 0.5 });

        const completed = me._targets.filter((t) => t.isCompleted).length;
        me._hud.setText(`${completed}/${me._targets.length}`);

        if (completed != me._targets.length)
            return;

        me._scene.sound.stopByKey('idle');
        me._scene.sound.play('win', { volume: 0.5 });

        const target = Config.Levels[me._levelIndex].targets[changed];
        const position = Utils.buildPoint(target.x, target.y);

        me._player.startWin(position);
        me._she.startWin(position, () => {
            me._scene.time.delayedCall(800, () => {
                const heart = me._scene.add.image(position.x - 25, position.y - 25, 'items', 14);
                me._scene.add.tween({
                    targets: heart,
                    y: position.y - 100,
                    duration: 2000,
                    ease: 'ease.SinIn',
                    alpha: { from: 1, to: 0 },
                    scale: { from: 0.75, to: 1.25 }
                });
            });
            me._scene.time.delayedCall(1500, () => {
                me._startRestart(Enums.GameResult.WIN);
            });
        });
    }

    _checkDeath(player) {
        const me = this;

        if (me._isDeath)
            return false;

        for (let i = 0; i < me._flames.length; ++i) {
            if (!me._flames[i].checkDamage(player))
                continue; 
                
            me._scene.sound.stopByKey('idle');
            me._scene.sound.play('death', { volume: 0.5 });
            me._isDeath = true;

            me._player.makeDeath();
            if (me._she.state == Enums.SheState.FLY)
                me._she.makeDeath();

            me._scene.time.delayedCall(
                1000,
                () => { me._startRestart(Enums.GameResult.LOSE) });

            return true;
        }

        return false;
    }

    _startRestart(result) {
        const me = this;

        if (me._isRestarting)
            return;

        me._isRestarting = true;

        me._scene.sound.stopAll();
        if (result == Enums.GameResult.RESTART)
            me._scene.sound.play('restart', { volume: 0.5 });

        me._player.disablePhysics();

        me._fade.setVisible(true).setAlpha(0);
        me._scene.add.tween({
            targets: me._fade,
            alpha: { from: 0, to: 1 },
            ease: 'Sine.easeInOut',
            duration: 1000,
            onComplete: () => {
                me._scene.scene.start(
                    'game', 
                    { level: result == Enums.GameResult.WIN ? me._levelIndex + 1 : me._levelIndex });
            }
        })
    }

    _processBeer() {
        const me = this;

        me._bigBottle.setVisible(false);
        me._player.startDrink();

        me._scene.sound.play('drink', { volume: 0.15 });

        me._she.hitDrink(() => {
            for (let i = 0; i < me._bottles.length; ++i)
                me._bottles[i].reset();    
            me._player.awake();

            const player = Utils.toPoint(me._player.toGameObject());

            for (let i = 0; i < 2; ++i) {
                const wave = me._waves.create(player.x, player.y, 'wave')
                    .setDepth(Consts.Depth.Foreground)
                    .play('wave')
                    .setFlipX(i == 0);

                me._scene.add.tween({
                    targets: wave,
                    x: player.x + 200 * (i == 0 ? -1 : 1),
                    alpha: { from: 1, to: 0 },
                    ease: 'Sine.easeOut',
                    duration: 1000,
                    onComplete: () => { me._waves.killAndHide(wave)}
                });

                for (let j = 0; j < me._flames.length; ++j)
                    me._flames[j].checkDestroy(player);

                me._scene.sound.play('hit', { volume: 0.25 });
            }
                
        });
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
            if (me._player.isGrounded()) {
                const jump = me._player.tryJump();
                if (jump)
                    me._scene.sound.play('jump', { volume: 0.5 });
            }
            else if (!me._player.useFly) {
                me._she.startFly(() => me._player.startFly());
                me._scene.sound.play('start_fly', { volume: 0.5 });
            }
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