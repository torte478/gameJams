import Phaser from '../lib/phaser.js';

import Config from './Config.js';
import Consts from './Consts.js';
import Controls from './Controls.js';
import Enums from './Enums.js';
import Player from './Player.js';
import Utils from './Utils.js';

export default class Core {

    /** @type {Phaser.Scene} */
    _scene;

    /** @type {Controls} */
    _controls;

    /** @type {Player} */
    _player;

    /** @type {Number} */
    _layer;

    /** @type {Phaser.Tilemaps.Tilemap} */
    _level;

    /** @type {Phaser.GameObjects.Image} */
    _fade; 

    /** @type {Phaser.Tweens.Tween[]}*/
    _layer1;

    /**
     * @param {Phaser.Scene} scene
     */
    constructor(scene) {
        const me = this;

        me._scene = scene;

        me._controls = new Controls(scene.input.keyboard);

        me._player = new Player(scene);
        me._layer = Enums.Layer.PRESENT;

        me._level = me._scene.make.tilemap({
            key: 'level',
            tileWidth: Consts.Unit.Small,
            tileHeight: Consts.Unit.Small
        });

        me._fade = scene.add.image(Consts.Viewport.Width / 2, Consts.Viewport.Height / 2, 'fade')
            .setDepth(Consts.Depth.Fade)
            .setScrollFactor(0)
            .setAlpha(0);

        const tileset = me._level.addTilesetImage('tiles');
        const tiles = me._level.createLayer(0, tileset)
            .setDepth(Consts.Depth.Tiles);

        me._level.setCollisionBetween(1, 3);

        const exit = me._scene.physics.add.image(925, 1525, 'sprites', 11);
        exit.body.setAllowGravity(false);

        me._scene.physics.add.collider(me._player.getCollider(), tiles);
        me._scene.physics.add.overlap(me._player.getCollider(), exit, () => {
            console.log('YOU WIN!!!');
        })

        me._layer1 = [
            me._createTurret(150, 1050, false, tiles),
            me._createTurret(775, 1400, true, tiles)
        ];

        me._scene.cameras.main.setScroll(0, me._layer * Consts.Viewport.Height);
    }

    update() {
        const me = this;

        me._controls.update();

        if (me._player.isBusy)
            return;

        // movement
        let signX = 0;
        if (me._controls.isDown(Enums.Keyboard.LEFT))
            signX = -1;
        else if (me._controls.isDown(Enums.Keyboard.RIGHT))
            signX = 1;

        me._player.setDirectionX(signX);

        if (me._controls.isDownOnce(Enums.Keyboard.UP))
            me._player.tryJump();

        // portals
        me._tryTeleport();
    }

    _tryTeleport() {
        const me = this;

        let shift = 0;
        if (me._controls.isDownOnce(Enums.Keyboard.X))
            shift = -1;
        else if (me._controls.isDownOnce(Enums.Keyboard.C))
            shift = 1;

        const nextLayer = me._layer + shift;

        if (nextLayer == me._layer || nextLayer < 0 || nextLayer >= Consts.Layers)
            return;

        const target = me._player.canTeleport(nextLayer, me._scene.physics, me._level);
        if (!target)
            return;

        me._player.teleport(target, me._scene.tweens);
        me._scene.tweens.createTimeline()
            .add({
                targets: me._fade,
                alpha: { from: 0, to: 1 },
                duration: 1000,
                ease: 'Sine.easeOut',
                onComplete: () => {
                    me._scene.cameras.main.setScroll(0, nextLayer * Consts.Viewport.Height);
                    me._player.setPositionY(target.y);
                    me._layer = nextLayer;
                }
            })
            .add({
                targets: me._fade,
                alpha: { from: 1, to: 0 },
                duration: 1000,
                ease: 'Sine.easeOut'
            })
            .play();
    }

    _createTurret(x, y, flip) {
        const me = this;

        const turret = me._scene.add.sprite(x, y, 'sprites', 1)
            .setFlipX(flip);
        const bullet = me._scene.physics.add.sprite(x, y, 'sprites_small')
        bullet.body.setAllowGravity(false);

        const speed = 700;
        const target = flip
            ? 0 - Consts.Unit.Small
            : Consts.Viewport.Width + Consts.Unit.Small;

        const bulletTween = me._scene.tweens.add({
            targets: bullet,
            x: { from: x, to: target },
            duration: Math.abs(target - x) / speed * 1000,
            repeat: -1,
            onUpdate: () => {
                if (!Utils.isTileFree(bullet.getBounds(), me._level))
                    bulletTween.restart();
            }
        });

        me._scene.physics.add.overlap(me._player.getCollider(), bullet, () => {
            bulletTween.restart();
            console.log('hit');
        });


        return bulletTween;
    }
}