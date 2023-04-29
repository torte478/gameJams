import Phaser from '../lib/phaser.js';

import Here from '../framework/Here.js';
import Utils from '../framework/Utils.js';

import Consts from './Consts.js';
import Enums from './Enums.js';
import Hand from './Hand.js';
import { ContainerOffset, SignalModel } from './Models.js';

export default class Player {

    /** @type {Hand} */
    _leftHand;

    /** @type {Hand} */
    _rightHand;

    /** @type {Phaser.Input.Pointer} */
    _mouse;

    /** @type {Phaser.GameObjects.Container} */
    _container;

    constructor() {
        const me = this;
        
        const body = Here._.add
            .image(0, 0, 'body');

        me._leftHand = new Hand(true);
        me._rightHand = new Hand(false);

        me._container = Here._.add.container(0, 0, [
            body,
            me._leftHand.getGameObject(),
            me._rightHand.getGameObject()
        ]);

        me._mouse = Here._.input.activePointer;
    }

    /**
     * @param {Number} delta 
     * @param {ContainerOffset} offset
     */
    update(delta, offset) {
        const me = this;

        const mouse = new Phaser.Math.Vector2(me._mouse.worldX, me._mouse.worldY);

        if (me._leftHand.updateRotation(me._mouse.leftButtonDown(), mouse, delta, offset))
            me._container.bringToTop(me._leftHand.getGameObject());

        if (me._rightHand.updateRotation(me._mouse.rightButtonDown(), mouse, delta, offset))
        me._container.bringToTop(me._rightHand.getGameObject());
    }

    getGameObject() {
        const me = this;

        return me._container;
    }

    getSignal() {
        const me = this;

        const left = me._leftHand.getAngle();
        const right = me._rightHand.getAngle();

        /** @type {SignalModel} */
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
}