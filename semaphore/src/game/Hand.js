import Here from '../framework/Here.js';
import Phaser from '../lib/phaser.js';
import Enums from './Enums.js';

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
        me._rotationSpeed = 720;
    }

    /**
     * @param {Boolean} isButtonPressed 
     * @param {Phaser.Math.Vector2} mouse 
     * @param {Number} delta
     */
    updateRotation(isButtonPressed, mouse, delta) {
        const me = this;

        if (isButtonPressed) {
            let rotation = Phaser.Math.Angle.BetweenPoints(me._sprite, mouse);

            if (me._isLeft)
                rotation += Math.PI;

            me._targetAngle = Phaser.Math.RadToDeg(rotation);
        } else {
            me._targetAngle = me._getNearestAngle();
        }

        const diff = me._targetAngle - me._sprite.angle;
        if (Math.abs(diff) < 0.01)
            return;

        const rotationValue = Math.min(Math.abs(diff), me._rotationSpeed) * Math.sign(diff);
        const newAngle = me._sprite.angle + rotationValue * (delta / 1000);
        me._sprite.setAngle(newAngle);
    }

    getAngle() {
        const me = this;
        
        let nearestAngle = me._getNearestAngle();
        if (me._isLeft)
            nearestAngle -= 180;

        return me._normalizeAngle(nearestAngle);
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