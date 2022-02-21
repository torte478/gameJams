import Phaser from '../lib/phaser.js';

import Config from './Config.js';
import Consts from './Consts.js';
import Controls from './Controls.js';
import Enums from './Enums.js';
import Utils from './Utils.js';

export default class Core {

    /** @type {Phaser.Scene} */
    _scene;

    /** @type {Controls} */
    _controls;

    /** @type {Phaser.Physics.Arcade.Sprite} */
    _player;

    /** @type {Number} */
    _layer;

    /**
     * @param {Phaser.Scene} scene
     */
    constructor(scene) {
        const me = this;

        me._scene = scene;

        me._controls = new Controls(scene.input.keyboard);

        me._player = me._scene.physics.add.sprite(Config.Player.X, Config.Player.Y, 'sprites', 0);
        me._layer = Enums.Layer.PRESENT;

        const level = me._scene.make.tilemap({
            key: 'level',
            tileWidth: Consts.Unit.Small,
            tileHeight: Consts.Unit.Small
        });

        const tileset = level.addTilesetImage('tiles');
        const tiles = level.createLayer(0, tileset)
            .setDepth(Consts.Depth.Tiles);

        level.setCollisionBetween(1, 3);

        const exit = me._scene.physics.add.image(925, 1525, 'sprites', 11);
        exit.body.setAllowGravity(false);

        me._scene.physics.add.collider(me._player, tiles);
        me._scene.physics.add.overlap(me._player, exit, () => {
            console.log('YOU WIN!!!');
        })

        me._scene.cameras.main.setScroll(0, me._layer * Consts.Viewport.Height);
    }

    update() {
        const me = this;

        me._controls.update();

        // movement
        let signX = 0;
        if (me._controls.isDown(Enums.Keyboard.LEFT))
            signX = -1;
        else if (me._controls.isDown(Enums.Keyboard.RIGHT))
            signX = 1;

        me._player.setVelocityX(signX * Config.Physics.VelocityX);

        const isJump = me._controls.isDownOnce(Enums.Keyboard.UP) 
                      && me._player.body.blocked.down;
        if (isJump)
            me._player.setVelocityY(Config.Physics.Jump);

        // portals

        let shift = 0;
        if (me._controls.isDownOnce(Enums.Keyboard.X))
            shift = -1;
        else if (me._controls.isDownOnce(Enums.Keyboard.C))
            shift = 1;

        const nextLayer = me._layer + shift;
        if (nextLayer != me._layer) {
            const pos = me._player.y % Consts.Viewport.Height;
            me._player.setY(nextLayer * Consts.Viewport.Height + pos);
            me._scene.cameras.main.setScroll(0, nextLayer * Consts.Viewport.Height);
            me._layer = nextLayer;
        }
    }
}