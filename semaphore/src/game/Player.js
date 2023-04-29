import Here from '../framework/Here.js';
import Phaser from '../lib/phaser.js';

export default class Player {

    /** @type {Phaser.GameObjects.Image} */
    _leftHand;

    /** @type {Phaser.GameObjects.Image} */
    _rightHand;

    /** @type {Phaser.Input.Pointer} */
    _mouse;

    constructor() {
        const me = this;

        const offset = 50;

        me._rightHand = Here._.add
            .image(offset, 0, 'hand')
            .setOrigin(0, 0.5);

        me._leftHand = Here._.add
            .image(-offset, 0, 'hand')
            .setFlipX(true)
            .setOrigin(1, 0.5);

        me._mouse = Here._.input.activePointer;
    }

    update() {
        const me = this;

        if (me._mouse.rightButtonDown())
            me._rightHand.setRotation(
                me._getRotationToMouse(me._rightHand));

        if (me._mouse.leftButtonDown())
            me._leftHand.setRotation(
                me._getRotationToMouse(me._leftHand) + Math.PI);
    }

    _getRotationToMouse(from) {
        const me = this;

        return Phaser.Math.Angle.Between(
            from.x,
            from.y,
            me._mouse.worldX,
            me._mouse.worldY);
    }
}