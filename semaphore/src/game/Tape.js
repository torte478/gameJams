import Phaser from '../lib/phaser.js';

import Here from '../framework/Here.js';

import Consts from './Consts.js';
import { SignalProcessResult } from './Models.js';

import SignalBox from './SignalBox.js';
import Queue from '../framework/Queue.js';

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

    /** @type {Number} */
    _signalStartTimeMs;

    /** @type {Number} */
    _signalTimeoutMs;

    /** @type {Queue} */
    _queue;

    /** @type {Phaser.Tweens.Tween} */
    _inputEffectTween;

    /** @type {Boolean} */
    _canCalcTimeout;

    constructor(startSignal) {
        const me = this;

        me._xOffset = 300;
        me._y = 300;
        me._signalTimeoutMs = 20000;

        me._first = new SignalBox(me._y, 'A');
        me._second = new SignalBox(me._y, 'B');
        me._isFirst = true;

        me._first.getGameObject().setAlpha(0);
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

        me._signalStartTimeMs = new Date().getTime();

        me._queue = new Queue();
        me._canCalcTimeout = true;
    }

    init(isMainMenu, text, timeout) {
        const me = this;

        me._isFirst = true;

        me._first.getGameObject().setAlpha(0);
        me._second.getGameObject().setAlpha(0);
        me._signalStartTimeMs = new Date().getTime();
        me._signalTimeoutMs = timeout;

        if (!isMainMenu)
            me.reset(text);
    }

    /**
     * @param {Phaser.Geom.Point} playerPos 
     * @param {SignalProcessResult} signal 
     * @param {Function} onMiddleCallback
     * @param {Function} onEndCallback
     * @param {Object} context
     */
    enqueueSignal(playerPos, signal, onMiddleCallback, onEndCallback, context) {
        const me = this;

        if (!!signal.cancel)
            return me._processCancel(signal, onMiddleCallback, context);

        me._queue.enqueue({
            playerPos: playerPos,
            signal: signal,
            onMiddleCallback: onMiddleCallback,
            onEndCallback: onEndCallback,
            context: context
        });
        me._canCalcTimeout = false;

        const delay = 500;

        if (!!me._inputEffectTween)
            me._inputEffectTween.remove();

        Here.Audio.play('send');

        me._inputEffect
            .setPosition(playerPos.x, playerPos.y)
            .setText(signal.from)
            .setAlpha(0);

        me._inputEffectTween = Here._.tweens.add({
            targets: me._inputEffect,
            x: 0,
            y: me._y,
            alpha: { from: 0, to: 1},
            duration: delay ,
            ease: 'sine.out',
            onComplete: () => {
                me._inputEffectTween = null;
                me._inputEffect.setAlpha(0); 
            } 
        });

        if (me._queue.size() == 1)
            Here._.time.delayedCall(
                delay,
                () => me._processSignalQueue(),
                me);
    }

    _processSignalQueue() {
        const me = this;

        if (me._queue.size() == 0) {
            me._canCalcTimeout = true;
            return;
        }

        /** @type {QueueItem} */
        const item = me._queue.top();
        if (!!item.onMiddleCallback)
            item.onMiddleCallback.call(item.context);

        me._onSignalProcessed.call(me, item.signal, item.onEndCallback, item.context);
    }

    /**
     * @returns {Boolean}
     */
    checkTimeout() {
        const me = this;

        if (!me._canCalcTimeout)
            return false;

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

        Here._.tweens.add({
            targets: me._first.getGameObject(),
            x: 0,
            alpha: { from: 0, to: 1},
            duration: 1000,
            ease: 'sine.inout',
            onComplete: () => { 
                me._signalStartTimeMs = new Date().getTime();
                me._canCalcTimeout = true;
            }
        });
    }

    /**
     * @param {SignalProcessResult} signal 
     */
    _processCancel(signal, callback, context) {
        const me = this;

        Here.Audio.play('cancel')

        if (me._queue.size() > 0)
            return me._queue.clear();

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

        me._signalStartTimeMs = new Date().getTime();
        Here._.tweens.add({
            targets: nextBox.getGameObject(),
            x: 0, 
            alpha: { from: 0, to: 1},
            duration: 1000,
            ease: 'sine.inout',
            onComplete: () => {
                me._signalStartTimeMs = new Date().getTime();
            }
        });
    }

    /**
     * @param {SignalProcessResult} signal 
     */
    _onSignalProcessed(signal, callback, context) {
        const me = this

        const currentBox = me._getCurrentBox();
        currentBox.setTint(signal.correct);

        if (signal.correct)
            Here.Audio.play('success')
        else 
            Here.Audio.play('fail', { volume: 0.5});

        Here._.tweens.add({
            targets: currentBox.getGameObject(),
            x: -me._xOffset,
            alpha: { from: 1, to: 0},
            duration: 1000,
            ease: 'sine.inout',
            onComplete: () => {
                if (!!signal.isLevelComplete)  {
                    me._queue.clear();
                    callback.call(context);
                }
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
            onComplete: () => {
                me._queue.dequeue();
                me._signalStartTimeMs = new Date().getTime();
                me._processSignalQueue()
            } 
        });
    }

    _getCurrentBox() {
        const me = this;

        return me._isFirst
            ? me._first
            : me._second;
    }
}

class QueueItem {

    /** @type {Phaser.Geom.Point} */
    playerPos;

    /** @type {SignalProcessResult} */
    signal;

    /** @type {Function} */
    onMiddleCallback;

    /** @type {Function} */
    onEndCallback;

    /** @type {Object} */
    context;
}

