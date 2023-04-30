import Phaser from '../lib/phaser.js';

import Here from '../framework/Here.js';

import Consts from './Consts.js';
import { SignalProcessResult } from './Models.js';

import SignalBox from './SignalBox.js';

export default class Tape {

    /** @type {Number} */
    _xOffset;

    /** @type {Number} */
    _y;

    /** @type {SignalBox} */
    _first;

    /** @type {SignalBox} */
    _second;

    /** @type {Boolean} */
    _isFirst;

    /** @type {Phaser.GameObjects.Text} */
    _inputEffect;

    /** @type {Boolean} */
    _isBusy;

    /** @type {Number} */
    _signalStartTimeMs;

    /** @type {Number} */
    _signalTimeoutMs;

    constructor(startSignal) {
        const me = this;

        me._xOffset = 300;
        me._y = 300;
        me._signalTimeoutMs = 60000;

        me._first = new SignalBox(me._y, startSignal);
        me._second = new SignalBox(me._y, 'A');
        me._isFirst = true;

        me._second.getGameObject().setAlpha(0);

        me._inputEffect = Here._.add.text(0, 0, 'A', {
            fontFamily: 'Arial Black',
            fontSize: 96,
            color: '#F0E2E1'
            })
            .setOrigin(0.5)
            .setStroke('#4A271E', 16)
            .setDepth(Consts.Depth.GUI_EFFECTS)
            .setAlpha(0);

        me._isBusy = false;
        me._signalStartTimeMs = new Date().getTime();
    }

    /**
     * @param {Phaser.Geom.Point} playerPos 
     * @param {SignalProcessResult} signal 
     * @param {Function} onMiddleCallback
     * @param {Function} onEndCallback
     * @param {Object} context
     */
    processSignal(playerPos, signal, onMiddleCallback, onEndCallback, context) {
        const me = this;

        if (me._isBusy)
            throw 'is busy!';

        me._isBusy = true;
        if (!!signal.cancel)
            return me._processCancel(signal, onMiddleCallback, context);

        me._inputEffect
            .setPosition(playerPos.x, playerPos.y)
            .setText(signal.from)
            .setAlpha(0);
            
        Here._.tweens.add({
            targets: me._inputEffect,
            x: 0,
            y: me._y,
            alpha: { from: 0, to: 1},
            duration: 500 ,
            ease: 'sine.out',
            onComplete: () => {
                if (!!onMiddleCallback)
                    onMiddleCallback.call(context);

                me._onSignalProcessed.call(me, signal, onEndCallback, context);
            } 
        });
    }

    /**
     * @returns {Boolean}
     */
    isBusy() {
        const me = this;

        return me._isBusy;
    }

    /**
     * @returns {Boolean}
     */
    checkTimeout() {
        const me = this;

        if (me._isBusy)
            throw 'is bussy!';

        const elapsed = new Date().getTime() - me._signalStartTimeMs;
        const progress = elapsed / me._signalTimeoutMs;

        me._getCurrentBox().updateProgress(progress);

        return progress >= 1;
    }

    reset(text) {
        const me = this;

        me._isFirst = true;

        me._first.getGameObject().setAlpha(0).setX(me._xOffset);
        me._first.reset(text);
        me._second.getGameObject().setAlpha(0);

        me._isBusy = true;
        Here._.tweens.add({
            targets: me._first.getGameObject(),
            x: 0,
            alpha: { from: 0, to: 1},
            duration: 1000,
            ease: 'sine.inout',
            onComplete: () => me._free.call(me)
        });
    }

    /**
     * @param {SignalProcessResult} signal 
     */
    _processCancel(signal, callback, context) {
        const me = this;

        if (!!callback)
            callback.call(context);

        const currentBox = me._getCurrentBox();

        Here._.tweens.add({
            targets: currentBox.getGameObject(),
            x: me._xOffset,
            alpha: { from: 1, to: 0},
            duration: 1000,
            ease: 'sine.inout'
        });

        me._isFirst = !me._isFirst;
        const nextBox = me._getCurrentBox();
        nextBox
            .getGameObject()
            .setAlpha(0)
            .setX(-me._xOffset);
        nextBox.reset(signal.to);

        Here._.tweens.add({
            targets: nextBox.getGameObject(),
            x: 0, 
            alpha: { from: 0, to: 1},
            duration: 1000,
            ease: 'sine.inout',
            onComplete: () => me._free.call(me)
        });
    }

    /**
     * @param {SignalProcessResult} signal 
     */
    _onSignalProcessed(signal, callback, context) {
        const me = this

        me._inputEffect.setAlpha(0);

        const currentBox = me._getCurrentBox();
        currentBox.setTint(signal.correct);

        Here._.tweens.add({
            targets: currentBox.getGameObject(),
            x: -me._xOffset,
            alpha: { from: 1, to: 0},
            duration: 1000,
            ease: 'sine.inout',
            onComplete: () => {
                if (!!signal.isLevelComplete)
                    me._free.call(me, callback, context);
            }
        });

        me._isFirst = !me._isFirst;
        if (!!signal.isLevelComplete)
            return;

        const nextBox = me._getCurrentBox();
        nextBox
            .getGameObject()
            .setAlpha(0)
            .setX(me._xOffset);
        nextBox.reset(signal.to);

        Here._.tweens.add({
            targets: nextBox.getGameObject(),
            x: 0,
            alpha: { from: 0, to: 1},
            duration: 1000,
            ease: 'sine.inout',
            onComplete: () => me._free.call(me)
        });
    }

    _getCurrentBox() {
        const me = this;

        return me._isFirst
            ? me._first
            : me._second;
    }

    _free(callback, context) {
        const me = this;

        me._isBusy = false;
        me._signalStartTimeMs = new Date().getTime();
        // TODO: sfx

        if (!!callback)
            callback.call(context);
    }
}

