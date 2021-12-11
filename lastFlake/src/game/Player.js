import Phaser from '../lib/phaser.js';

import Consts from '../game/Consts.js';

export default class Player {

    /** @type {Phaser.Physics.Arcade.Sprite} */
    sprite;

    /**
     * @param {Phaser.Scene scene 
     * @param {Number} x 
     * @param {Number} y 
     */
    constructor(scene, x, y) {
        const me = this;

        me.sprite = scene.physics.add.sprite(x, y, 'player');
    }

    move(dir) {
        const me = this;

        me.sprite.setVelocityX(Consts.player.speed * dir);
    }
}