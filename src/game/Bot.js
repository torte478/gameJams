import Phaser from '../lib/phaser.js';

import Consts from './Consts.js';

export default class Bot {
    /** @type {Phaser.Scene} */
    scene;

    /** @type {String} */
    name;

    /** @type {Phaser.Physics.Arcade.Sprite} */
    image;

    /** @type {Array} */
    path;

    /** @type {Number} */
    index;

    /**
     * @param {Phaser.Scene} scene
     * @param {String} image 
     * @param {Array} path 
     */
    constructor(scene, name, path) {
        const me = this;

        me.scene = scene;
        me.name = name;
        
        me.path = path;

        me.image = scene.physics.add.sprite(0, 0, me.name);
        me.image.setPosition(path[0].x, path[1].y);
        me.image.play(me.name + '_walk');

        me.index = 0;
    }

    update() {
        const me = this;

        const position = { x: me.image.x, y: me.image.y };
        const target = me.path[me.index];

        if (Phaser.Math.Distance.BetweenPoints(position, target) < Consts.distanceEps) {
            me.index = (me.index + 1) % me.path.length;
            me.scene.physics.moveTo(
                me.image, 
                me.path[me.index].x, 
                me.path[me.index].y, 
                Consts.botSpeed);
        }
    }
}