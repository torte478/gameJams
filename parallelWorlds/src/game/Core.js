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
     * @param {Controls} controls
     * @param {Phaser.GameObjects.GameObjectFactory} factory 
     * @param {Phaser.Physics.Arcade.ArcadePhysics} physics
     * @param {Phaser.Tilemaps.Tilemap} level
     */
    constructor(controls, factory, physics, level) {
        const me = this;

        me._controls = controls;

        const tileset = level.addTilesetImage('tiles');
        const tiles = level.createLayer(0, tileset)
            .setDepth(Consts.Depth.Tiles);

        level.setCollisionBetween(1, 3);

        me._player = physics.add.sprite(Config.Player.X, Config.Player.Y, 'sprites', 0);

        const exit = physics.add.image(925, 1525, 'sprites', 11);
        exit.body.setAllowGravity(false);

        physics.add.collider(me._player, tiles);
        physics.add.overlap(me._player, exit, () => {
            console.log('YOU WIN!!!');
        })
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