import Phaser from '../lib/phaser.js';

import Config from './Config.js';
import Consts from './Consts.js';
import Controls from './Controls.js';
import Enums from './Enums.js';
import Utils from './Utils.js';

export default class Core {

    /** @type {Phaser.Physics.Arcade.Sprite} */
    _player;

    /** @type {Controls} */
    _controls;

    /**
     * @param {Phaser.GameObjects.GameObjectFactory} factory 
     * @param {Phaser.Physics.Arcade.ArcadePhysics} physics
     * @param {Phaser.Tilemaps.Tilemap} level
     * @param {Controls} controls
     */
    constructor(factory, physics, level, controls) {
        const me = this;

        const tileset = level.addTilesetImage('tiles');
        const tiles = level.createLayer(0, tileset)
            .setDepth(Consts.Depth.Tiles);

        level.setCollisionBetween(1, 3);

        me._player = physics.add.sprite(Config.Player.X, Config.Player.Y, 'sprites', 0);

        physics.collide(me._player, tiles)

        physics.add.collider(me._player, tiles);

        me._controls = controls;
    }

    update() {
        const me = this;

        let signX = 0;
        if (me._controls.isDown(Enums.Keyboard.LEFT))
            signX = -1;
        else if (me._controls.isDown(Enums.Keyboard.RIGHT))
            signX = 1;

        me._player.setVelocityX(signX * Config.Physics.VelocityX);

        const isJump = me._controls.isDown(Enums.Keyboard.UP) 
                      && me._player.body.blocked.down;
        if (isJump)
            me._player.setVelocityY(Config.Physics.Jump);
    }
}