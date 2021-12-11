import Phaser from '../lib/phaser.js';

import Consts from './Consts.js';

export default class Stair {

    /** @type {Phaser.Scene} */
    scene;

    /** @type {Phaser.GameObjects.Sprite} */
    sprite;

    /** @type {Number} */
    toY;

    /** @type {Number} */
    type;

    /** 
     * @param {Phaser.Scene} scene 
     * @param {Number} x 
     * @param {Number} fromY 
     * @param {Number} toY 
     * @param {Number} type 
     */
    constructor(scene, x, fromY, toY, type) {
        const me = this;

        me.scene = scene;

        me.sprite = scene.add.sprite(x, fromY, 'small_arrows')
            .play(type == Consts.stairType.UP ? 'small_arrow_up' : 'small_arrow_down');

        me.toY = toY;        
        me.type = type;
    }

    /**
     * @param {Phaser.Physics.Arcade.Sprite} other 
     */
    move(other) {
        const me = this;

        me.scene.tweens.add({
            targets: other,
            x: me.sprite.x,
            y: me.toY,
            duration: me.type == Consts.stairType.UP ? 1000 : 250
        });
    }
}