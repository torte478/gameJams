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

    /** @type {Phaser.Events.EventEmitter} */
    emitter;

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

        me.emitter = new Phaser.Events.EventEmitter();
    }

    /**
     * @param {Phaser.Physics.Arcade.Sprite} other 
     */
    move(other) {
        const me = this;

        me.scene.player.isBusy = true;

        if (me.type == Consts.stairType.ROOF) {
            me.scene.cameras.main.stopFollow();
            const timeline = me.scene.tweens.createTimeline();
            timeline
                .add({
                    targets: other,
                    x: me.sprite.x - 100,
                    y: me.sprite.y - 50,
                    duration: 250,
                    ease: 'Sine.easeOut'
                })
                .add({
                    targets: other,
                    x: me.sprite.x - 200,
                    y: me.toY,
                    duration: 1000,
                    ease: 'Sine.easeIn',
                    onComplete: () => { 
                        me.emitter.emit('roofJump'); 
                        me.scene.player.isBusy = false; }
                })
                .play();
        }
        else {
            me.scene.tweens.add({
                targets: other,
                x: me.sprite.x,
                y: me.toY,
                duration: me.type == Consts.stairType.UP ? 1000 : 250,
                onComplete:() => { me.scene.player.isBusy = false; }
            });
        }
    }
}