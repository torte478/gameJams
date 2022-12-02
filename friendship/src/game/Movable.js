import Phaser from '../lib/phaser.js';
import Config from './Config.js';
import Utils from './utils/Utils.js';

export default class Movable {

    /** @type {Phaser.Scene} */
    _scene;

    /** @type {Phaser.Physics.Arcade.Sprite} */
    _sprite;

    /** @type {Phaser.Geom.Point} */
    _target;

    /** @type {Boolean} */
    _needUpdate;

    /** @type {Boolean} */
    _isStopping;

    /**
     * 
     * @param {Phaser.Scene} scene 
     * @param {Phaser.Physics.Arcade.Group} group
     * @param {Number} x 
     * @param {Number} y 
     */
    constructor(scene, group, x, y) {
        const me = this;

        me._scene = scene;
        me._needUpdate = false;
        me._isStopping = false;

        me._sprite = group.create(x, y, 'main', 2)
            .setCollideWorldBounds(true)
            .setBounce(0.5)

        me._sprite.isMovable = true;
        me._sprite.owner = me;
    }

    update(delta) {
        const me = this;

        if (!me._needUpdate)
            return;

        if (!!me._target) {
            const dist = Phaser.Math.Distance.BetweenPoints(
                me._sprite,
                me._target);
    
            if (!me._isStopping && dist < 10) {
                me.stopAccelerate();
                me._target = null;
            }
        }

        if (me._isStopping) {
            me._sprite.setAcceleration(
                -Math.sign(me._sprite.body.velocity.x) * Config.Speed.ConnectionFriction,
                -Math.sign(me._sprite.body.velocity.y) * Config.Speed.ConnectionFriction);

            const isStop = Math.abs(me._sprite.body.velocity.x) < 10
                           && Math.abs(me._sprite.body.velocity.y) < 10;
            if (isStop) {
                me._isStopping = false;
                me._needUpdate = false;
                me._sprite.setAcceleration(0);
                me._sprite.setVelocity(0);
            }
        }
    }

    /**
     * @returns {Phaser.GameObjects.GameObject}
     */
    toGameObject() {
        const me = this;

        return me._sprite;
    }

    /**
     * @param {Phaser.Geom.Point} point 
     */
    moveTo(point) {
        const me = this;

        me._target = point;

        me._scene.physics.accelerateTo(
            me._sprite,
            me._target.x, 
            me._target.y, 
            Config.Speed.ConnectionStep, 
            Config.Speed.ConnectionMax, 
            Config.Speed.ConnectionMax)

        me._needUpdate = true;
    }

    stopAccelerate() {
        const me = this;

        if (me._isStopping)
            return;

        me._sprite.setAcceleration(0);
        me._isStopping = true;
        me._needUpdate = true;
    }
}