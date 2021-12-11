import Phaser from '../lib/phaser.js';

import Consts from '../game/Consts.js';

export default class Player {

    /** @type {Phaser.Physics.Arcade.Sprite} */
    sprite;

    /** @type {Boolean} */
    isEat;

    /**
     * @param {Phaser.Scene scene 
     * @param {Number} x 
     * @param {Number} y 
     */
    constructor(scene, x, y) {
        const me = this;

        me.sprite = scene.physics.add.sprite(x, y, 'kids', 0);
        me.isEat = false;
    }

    move(dir) {
        const me = this;

        me.sprite.setVelocityX(Consts.player.speed * dir);

        if (dir != 0) {
            me.sprite.play('kid_0_walk', true);
            me.sprite.flipX = dir < 0;
        }
        else {
            me.sprite.setFrame(0);
            me.sprite.stop();
        }
    }

    startEat() {
        const me = this;

        me.isEat = true;
        me.sprite.stop();
        me.sprite.setTexture('kids', 2);
        me.sprite.setVelocityX(0);
    }

    stopEat() {
        const me = this;

        me.isEat = false;
        me.sprite.setTexture('kids', 2);
    }
}