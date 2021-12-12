import Phaser from '../lib/phaser.js';

import Consts from '../game/Consts.js';

export default class Generator {

    /** @type {Phaser.Scene} */
    scene;
    
    /** @type {Phaser.GameObjects.Sprite} */
    sprite;

    /** @type {Phaser.Events.EventEmitter} */
    emitter;

    /** @type {Array} */
    garlands;

    /** @type {Array} */
    electricity;

    /** @type {Boolean} */
    running;

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
        me.garlands = garlandPositions
            .map((pos) => scene.add.sprite(pos.x, pos.y, 'garland', 2)
                .setDepth(100));
        me.electricity = me.garlands
            .map((g) => scene.add.sprite(g.x, g.y, 'electricity')
                .setVisible(false)
                .play('electricity'));
        me.running = false;
    }

    canStart(x, y) {
        const me = this;

        const distance = Phaser.Math.Distance.Between(
            me.sprite.x,
            me.sprite.y,
            x,
            y);

        return !me.running && distance < Consts.unit * 1.5;
    }

    start() {
        const me = this;

        me.sprite.play('generator');
        me.garlands.forEach((g) => g.play('garland'));
        me.electricity.forEach((e) => e.setVisible(true));
        me.running = true;

        me.scene.time.delayedCall(
            1000,
            () => {
                me.sprite.stop();
                me.sprite.setFrame(0);

                me.garlands.forEach((g) => {
                    g.stop();
                    g.setFrame(2);
                })

                me.electricity.forEach((e) => e.setVisible(false));

                me.emitter.emit('generatorFinished', me.sprite.x, me.sprite.y);
                me.running = false;
            });
    }
}