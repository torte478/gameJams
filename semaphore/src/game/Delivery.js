export default class Delivery {

    /** @type {String} */
    _word;

    /** @type {Number} */
    _index;

    /** @type {String} */
    _currentLetter;

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
        me._currentLetter = me._word[me._index];
        me._currentWord = '';
        me._isNumerals = false;
    }

    /**
     * @param {String} signal 
     * @returns {Boolean}
     */
    applySignal(signal) {
        const me = this;

        if (signal == 'SWITCH') {
            me._isNumerals = !me._isNumerals;
            return false
        }

        if (signal == 'CANCEL') {
            if (me._index > 0) {
                --me._index;
                me._currentWord = me._currentWord.substring(0, me._currentWord.length - 1);
            }
            return false;
        }

        ++me._index;
        me._currentWord += me._getChar(signal);

        const isComplete = me._index >= me._word.length;
        if (!isComplete)
            me._currentLetter = me._word[me._index];

        return isComplete;
    }

    _getChar(signal) {
        const me = this;

        if (signal == 'SPACE')
            return ' ';

        if (signal == 'UNKNOWN')
            return '?';

        const lowercase = signal.toLowerCase();
        
        if (!me._isNumerals)
            return lowercase[0];

        return lowercase.length == 2
            ? lowercase[1]
            : '?';
    }
}