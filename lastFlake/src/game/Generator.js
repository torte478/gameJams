import Phaser from '../lib/phaser.js';

import Consts from '../game/Consts.js';

export default class Generator {

    /** @type {Phaser.Scene} */
    scene;
    
    /** @type {Phaser.GameObjects.Sprite} */
    sprite;

    /** @type {Phaser.Events.EventEmitter} */
    emitter;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Number} x 
     * @param {Number} y 
     * @param {Array} garlandPositions 
     */
    constructor(scene, x , y, garlandPositions) {
        const me = this;

        me.scene = scene;
        me.sprite = scene.add.sprite(x, y, 'generator', 0);
        me.emitter = new Phaser.Events.EventEmitter();
    }

    canStart(x, y) {
        const me = this;

        const distance = Phaser.Math.Distance.Between(
            me.sprite.x,
            me.sprite.y,
            x,
            y);

        return distance < Consts.unit * 1.5;
    }

    start() {
        const me = this;

        me.sprite.play('generator');

        me.scene.time.delayedCall(
            3000,
            () => {
                me.sprite.stop();
                me.sprite.setFrame(0);
                me.emitter.emit('generatorFinished', me.sprite.x, me.sprite.y);
            });
    }
}