import Here from "../framework/Here.js";
import Consts from "./Consts.js";
import { SignalProcessResult } from "./Models.js";

export default class Delivery {

    /** @type {String} */
    _word;

    /** @type {Number} */
    _index;

    /** @type {String} */
    _current;

    /** @type {String} */
    _currentWord;

    /** @type {Boolean} */
    _isNumerals;

    /** @type {Phaser.GameObjects.Particles.ParticleEmitter} */
    _numeralParticles;

    /** @type {Phaser.Time.TimerEvent} */
    _particlesTimer;

    /**
     * @param {String} word 
     */
    constructor(word) {
        const me = this;

        me._word = word;

        me._index = 0;
        me._current = me._word[me._index];
        me._currentWord = '';
        me._isNumerals = false;

        me._numeralParticles = Here._.add
            .particles('letters_numbers')
            .setDepth(Consts.Depth.GUI_EFFECTS)
            .createEmitter({
                speed: 200,
                on: false,
                alpha: { start: 0, end: 1},
                frame: [ 0, 1, 2, 3, 4, 5, 6, 7],
                scale: { start: 1, end: 0},
            });
    }

    /**
     * @param {String} signal 
     * @param {Phaser.Geom.Point}
     * @returns {SignalProcessResult}
     */
    applySignal(signal, position) {
        const me = this;

        if (signal == 'SWITCH') {
            me._isNumerals = !me._isNumerals;
            me._runNumeralParticles(position);
            return { currentChanged: false };
        }

        if (signal == 'CANCEL') {
            if (me._index == 0) 
                return { currentChanged: false };
            
            --me._index;
            me._currentWord = me._currentWord.substring(0, me._currentWord.length - 1);
            me._current = me._word  [me._index];
            
            return { 
                currentChanged: true,
                cancel: true,
                to: me._current.toUpperCase() 
            };
        }

        /** @type {String} */
        const currentChar = me._getChar(signal);
        const correct = currentChar == me._current;

        ++me._index;
        me._currentWord += currentChar;

        const isComplete = me._index >= me._word.length;
        if (!isComplete)
            me._current = me._word[me._index];

        return { 
            isLevelComplete: isComplete, 
            currentChanged: true,
            from: currentChar.toUpperCase(),
            to: me._current.toUpperCase(),
            correct: correct };
    }

    init(message) {
        const me = this;

        me._word = message;
        me.reset();
    }

    reset() {
        const me = this;

        me._index = 0;
        me._current =  me._word[0];
        me._currentWord = '';
        me._isNumerals = false;
    }

    getMessage() {
        const me = this;

        return me._currentWord.toUpperCase();
    }

    isComplete() {
        const me = this;

        return me._currentWord.length >= me._word.length;
    }

    _runNumeralParticles(position) {
        const me = this;

        me._numeralParticles
            .setPosition(position.x, position.y)
            .setFrame(
                me._isNumerals
                    ? [ 8, 9, 10, 11, 12, 13, 14, 15]
                    : [ 0, 1, 2, 3, 4, 5, 6, 7]);

        me._numeralParticles.on = true;
        if (!!me._particlesTimer)
            me._particlesTimer.destroy();

        me._particlesTimer = Here._.time.delayedCall(
            1000, 
            () => {
                me._numeralParticles.on = false;
                me._particlesTimer.destroy();
            })
    }

    _getChar(signal) {
        const me = this;

        if (signal == 'SPACE')
            return '_';

        if (signal == 'UNKNOWN')
            return '?';

        const lowercase = signal.toLowerCase();
        
        return me._isNumerals && lowercase.length == 2
            ? lowercase[1]
            : lowercase[0];
    }
}