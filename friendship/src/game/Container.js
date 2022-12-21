import Phaser from '../lib/phaser.js';
import Config from './Config.js';
import Consts from './Consts.js';
import Movable from './Movable.js';
import Utils from './utils/Utils.js';

export default class Container extends Movable {

    /** @type {Boolean} */
    _isCatchedByCatcher;

    /** @type {Number} */
    _size; 

    /** @type {Number} */
    _type;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Phaser.Physics.Arcade.Group} group
     * @param {Number} x 
     * @param {Number} y 
     */
    constructor(scene, group, x, y) {
        /** @type {Phaser.Physics.Arcade.Sprite} */
        const sprite = group.create(x, y, 'big', 0);

        sprite
            .setCircle(Consts.Unit)
            .setCollideWorldBounds(true)
            .setBounce(0.5)

        super(scene, group, sprite);

        const me = this;
        me._isCatchedByCatcher = false;
        me._size = 0;
        me._type = -1;
    }

    catchEnemy(size, type) {
        const me = this;

        me.stopAccelerate();
        let frame = 1 + type;
        if (type == 2)
            frame += me._size;
        me._bodyContainer.setFrame(frame);

        me._size += size;
        me._type = type;
    }

    isFree(size) {
        const me = this;

        return me._size === 0 || (me._size + size <= Config.ContainerCapacity);
    }

    getType() {
        const me = this;

        return me._type;
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
                    ease: 'Sine.easeInOut',
                    onComplete: () => { me._bodyContainer.setDepth(Consts.Depth.Hub) }
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