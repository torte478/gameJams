import Phaser from '../lib/phaser.js';
import Config from './Config.js';
import Consts from './Consts.js';
import Movable from './Movable.js';
import Utils from './utils/Utils.js';

export default class Container extends Movable {

    /** @type {Boolean} */
    _isFree;

    /** @type {Boolean} */
    _isCatchedByCatcher;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Phaser.Physics.Arcade.Group} group
     * @param {Number} x 
     * @param {Number} y 
     */
    constructor(scene, group, x, y) {
        /** @type {Phaser.Physics.Arcade.Sprite} */
        const sprite = group.create(x, y, 'big', 1);

        sprite
            .setCircle(Consts.Unit)
            .setCollideWorldBounds(true)
            .setBounce(0.5)

        super(scene, group, sprite);

        const me = this;
        me._isFree = true;
        me._isCatchedByCatcher = false;
    }

    catchEnemy() {
        const me = this;

        if (!me._isFree)
            throw 'container is not free';

        me.stopAccelerate();
        me._bodyContainer.setFrame(2);
        me._isFree = false;
    }

    isFree() {
        const me = this;

        return me._isFree;
    }

    /**
     * @param {Number} x 
     * @param {Number} y 
     * @param {Function} callback 
     * @param {Object} context 
     */
    startCatchByCatcher(x, y, callback, context) {
        const me = this;

        me._isCatchedByCatcher = true;

        me._bodyContainer.setAcceleration(0);
        me._isStopping = true;
        me._needUpdate = true;
        me._bodyContainer.setVelocity(0);
        me._bodyContainer.body.setEnable(false);
        me._isCatcherBy

        me._scene.tweens.timeline({
            targets: me._bodyContainer,
            tweens: [
                {
                    x: x,
                    y: y,
                    duration: Utils.getTweenDuration(
                        Utils.toPoint(me._bodyContainer),
                        Utils.buildPoint(x, y),
                        Config.Physics.CatcherSpeed),
                    ease: 'Sine.easeInOut'
                },
                {
                    x: x - 100,
                    duration: 1000,
                    scale: { from: 1, to: 0.5 }
                }
            ],
            onComplete: () => {
                if (!!callback)
                    callback.call(context);
            }
        })
    }
}