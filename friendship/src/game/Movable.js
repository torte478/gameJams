import Phaser from '../lib/phaser.js';
import Config from './Config.js';
import Utils from './utils/Utils.js';

export default class Movable {

    /** @type {Phaser.Scene} */
    _scene;
    
    /** @type {Phaser.Physics.Arcade.Group} */
    _group;

    /** @type {Phaser.Physics.Arcade.Sprite} */
    _bodyContainer;

    /** @type {Phaser.Geom.Point} */
    _target;

    /** @type {Boolean} */
    _needUpdate;

    /** @type {Boolean} */
    _isStopping;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Phaser.Physics.Arcade.Group} group
     * @param {Phaser.Physics.Arcade.Sprite} bodyContainer
     */
    constructor(scene, group, bodyContainer) {
        const me = this;

        me._scene = scene;
        me._group = group;
        me._needUpdate = false;
        me._isStopping = false;
        me._bodyContainer = bodyContainer;

        me._bodyContainer.isMovable = true;
        me._bodyContainer.owner = me;
    }

    update(delta) {
        const me = this;

        if (!me._needUpdate)
            return;

        if (!!me._target) {
            const dist = Phaser.Math.Distance.BetweenPoints(
                me._bodyContainer,
                me._target);
    
            if (!me._isStopping && dist < 10) {
                me.stopAccelerate();
                me._target = null;
            }
        }

        if (me._isStopping) {
            me._bodyContainer.setAcceleration(
                -Math.sign(me._bodyContainer.body.velocity.x) * Config.Speed.ConnectionFriction,
                -Math.sign(me._bodyContainer.body.velocity.y) * Config.Speed.ConnectionFriction);

            const isStop = Math.abs(me._bodyContainer.body.velocity.x) < 10
                           && Math.abs(me._bodyContainer.body.velocity.y) < 10;
            if (isStop) {
                me._isStopping = false;
                me._needUpdate = false;
                me._bodyContainer.setAcceleration(0);
                me._bodyContainer.setVelocity(0);
            }
        }
    }

    /**
     * @returns {Phaser.GameObjects.GameObject}
     */
    toGameObject() {
        const me = this;

        return me._bodyContainer;
    }

    /**
     * @param {Phaser.Geom.Point} point 
     */
    moveTo(point) {
        const me = this;

        me._target = point;

        me._scene.physics.accelerateTo(
            me._bodyContainer,
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

        me._bodyContainer.setAcceleration(0);
        me._isStopping = true;
        me._needUpdate = true;
    }

    backToPool() {
        const me = this;

        me._bodyContainer.setVelocity(0);
        me._bodyContainer.setAcceleration(0);
        me._needUpdate = false;
        me._isStopping = false;
        me._bodyContainer.setPosition(Config.TrashPosition.x, Config.TrashPosition.y);
        me._bodyContainer.body.setEnable(false);
        me._group.killAndHide(me._bodyContainer);       
    }
}