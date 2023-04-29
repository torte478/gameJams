import Here from '../framework/Here.js';
import Utils from '../framework/Utils.js';
import Phaser from '../lib/phaser.js';
import Enums from './Enums.js';
import { ContainerOffset } from './Models.js';

export default class Hand {

    /** @type {Phaser.GameObjects.Sprite} */
    _sprite;

    /** @type {Boolean} */
    _isLeft;

    /** @type {Number} */
    _targetAngle;

    /** @type {Number} */
    _rotationSpeed;

    /**
     * @param {Boolean} isLeft 
     */
    constructor(isLeft) {
        const me = this;

        me._isLeft = isLeft;
        const origin = new Phaser.Math.Vector2(0.1, 0.5);
        
        me._sprite = Here._.add
            .image(35 * (isLeft ? -1 : 1), -75, 'hand', 0)
            .setOrigin(isLeft ? 1 - origin.x : origin.x, origin.y)
            .setFlipX(isLeft);

        me._targetAngle = 0;
        me._rotationSpeed = 360;
    }

    getGameObject() {
        const me = this;
        return me._sprite;
    }

    /**
     * @param {Boolean} isButtonPressed 
     * @param {Phaser.Math.Vector2} mouse 
     * @param {Number} delta
     * @param {ContainerOffset} offset
     * @returns {Boolean}
     */
    updateRotation(isButtonPressed, mouse, delta, offset) {
        const me = this;

        me._targetAngle = me._getTargetAngle(isButtonPressed, mouse, offset);

        me._rotateHand(delta);

        const currentFrame = Number(me._sprite.frame.name);
        const nextFrame = Math.abs(me._sprite.angle) > 90 ? 1 : 0;
        if (currentFrame == nextFrame)
            return false;
    
        me._sprite.setFrame(nextFrame);
        return true;
    }

    /**
     * @returns {Number}
     */
    getAngle() {
        const me = this;
        
        let nearestAngle = me._getNearestAngle();
        if (me._isLeft)
            nearestAngle -= 180;

        return me._normalizeAngle(nearestAngle);
    }

    /**
     * @param {Number} depth 
     */
    setDepth(depth) {
        const me = this;

        me._sprite.setDepth(depth);
    }

    _rotateHand(delta) {
        const me = this;

        let diff = me._targetAngle - me._sprite.angle;
        if (diff > 180)
            diff -= 360;
        else if (diff < -180)
            diff += 360;

        if (Math.abs(diff) < 0.01)
            return;

        const rotationValue = Math.sign(diff) * Math.min(
                Math.abs(diff), 
                me._rotationSpeed * (delta / 1000));

        me._sprite.setAngle(me._sprite.angle + rotationValue);
    }
 
    /**
     * @param {Boolean} isButtonPressed 
     * @param {Phaser.Geom.Point} mouse 
     * @param {ContainerOffset} offset 
     * @returns {Number}
     */
    _getTargetAngle(isButtonPressed, mouse, offset) {
        const me = this;

        if (!isButtonPressed)
            return me._getNearestAngle();

        const point = Utils.buildPoint(
            me._sprite.x + offset.x,
            me._sprite.y + offset.y
        );
        let rotation = Phaser.Math.Angle.BetweenPoints(point, mouse);

        if (me._isLeft)
            rotation += Math.PI;

        return Phaser.Math.RadToDeg(rotation) - offset.angle;
    }

    _normalizeAngle(angle) {
        let result = angle;
        if (result == -180)
            return 180;

        while (result > 180)
            result -= 360;
        
        while (result < -180)
            result += 360

        return result;
    }

    /**
     * @returns {Number}
     */
    _getNearestAngle() {
        const me = this;

        let nearestAngle = Enums.Angles.p0;
        let minDiff = 999;
        for (let key in Enums.Angles) {
            const angle = Enums.Angles[key];
            const diff = Math.abs(angle - me._sprite.angle);

            if (diff > minDiff)
                continue;

            minDiff = diff;
            nearestAngle = angle;
        }
        
        if (nearestAngle == Enums.Angles.n180)
            return Enums.Angles.p180;

        return nearestAngle;
    }
}