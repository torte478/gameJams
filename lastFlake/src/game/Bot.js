import Phaser from '../lib/phaser.js';

import Consts from '../game/Consts.js';

export default class Bot {

    /** @type {Phaser.Scene} */
    scene;

    /** @type {Phaser.Physics.Arcade.Sprite} */
    sprite;

    /** @type {Phaser.Geom.Point} */
    target;

    /**
     * 
     * @param {Phaser.Scene} scene 
     * @param {Number} x 
     * @param {Number} y 
     */
    constructor(scene, x, y) {
        const me = this;

        me.scene = scene;
        me.sprite = scene.physics.add.sprite(x, y, 'square');
        me.target = new Phaser.Geom.Point(x, y);
    }

    update() {
        const me = this;

        const distance = Math.abs(me.sprite.x - me.target.x);
        if (distance < Consts.unit / 2) {
            me.sprite.body.reset(me.target.x, me.target.y);
        }
    }

    onFlakeCreated(pos) {
        const me = this;

        me.target = new Phaser.Geom.Point(pos, me.sprite.y);
        me.scene.physics.moveToObject(me.sprite, this.target, Consts.botSpeed);
    }
}