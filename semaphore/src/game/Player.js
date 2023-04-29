import Phaser from '../lib/phaser.js';

import Here from '../framework/Here.js';
import Utils from '../framework/Utils.js';

import Consts from './Consts.js';
import Enums from './Enums.js';
import SignalConfig from './SignalConfig.js';

export default class Player {

    /** @type {Phaser.GameObjects.Image} */
    _leftHand;

    /** @type {Phaser.GameObjects.Image} */
    _rightHand;

    /** @type {Phaser.Input.Pointer} */
    _mouse;

    constructor() {
        const me = this;

        const x = 35;
        const y = -75;
        const offset = 0;
        const origin = new Phaser.Math.Vector2(0.1, 0.5);
        

        const body = Here._.add
            .image(0, 0, 'body');

        me._rightHand = Here._.add
            .image(x + offset, y, 'hand')
            .setOrigin(origin.x, origin.y);

        me._leftHand = Here._.add
            .image(-x + offset, y, 'hand')
            .setFlipX(true)
            .setOrigin(1 - origin.x, origin.y);

        me._mouse = Here._.input.activePointer;
    }

    update() {
        const me = this;

        me._setRotation(me._leftHand, me._mouse.leftButtonDown(), true);
        me._setRotation(me._rightHand, me._mouse.rightButtonDown(), false);
    }

    getSignal() {
        const me = this;

        const left = me._normalizeAngle(me._getNearestAngle(me._leftHand) - 180);
        const right = me._normalizeAngle(me._getNearestAngle(me._rightHand));

        /** @type {SignalConfig} */
        const signal = Utils.firstOrNull(
            Consts.Signals,
            s => s.left == left && s.right == right);

        if (signal == null)
            return 'UNKNOWN';

        const index = signal.signal;
        for (let key in Enums.Signals)
            if (Enums.Signals[key] == index)
                return key;

        throw `Unknown signal l(${left}) r(${right}): ${index}`;
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
     * @param {Phaser.GameObjects.Image} hand 
     * @param {Boolean} isMousePressed 
     * @param {Boolean} isLeft 
     */
    _setRotation(hand, isMousePressed, isLeft) {
        const me = this;

        if (isMousePressed) {
            let rotation = Phaser.Math.Angle.Between(
                hand.x,
                hand.y,
                me._mouse.worldX,
                me._mouse.worldY)

            if (isLeft)
                rotation += Math.PI;

            hand.setRotation(rotation);
        } else {
            const nearestAngle = me._getNearestAngle(hand);
            hand.setAngle(nearestAngle);
        }
    }

    /**
     * @param {Phaser.GameObjects.Image} hand 
     * @returns {Number}
     */
    _getNearestAngle(hand) {
        let nearestAngle = Enums.Angles.p0;
        let minDiff = 999;
        for (let key in Enums.Angles) {
            const angle = Enums.Angles[key];
            const diff = Math.abs(angle - hand.angle);

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