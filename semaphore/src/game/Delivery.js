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
    }

    /**
     * @param {String} signal 
     * @returns {SignalProcessResult}
     */
    applySignal(signal) {
        const me = this;

        if (signal == 'SWITCH') {
            me._isNumerals = !me._isNumerals;
            return { currentChanged: false };
        }

        if (signal == 'CANCEL') {
            if (me._index > 0) {
                --me._index;
                me._currentWord = me._currentWord.substring(0, me._currentWord.length - 1);
            }
            return { currentChanged: false };
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