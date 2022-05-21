export default class Timer { 

    /** @type {Number} */
    _duration;

    /** @type {Number} */
    _finishTime;

    /** @type {Boolean} */
    _isPause;

    /** @type {Number} */
    _remain;

    /**
     * @param {Number} duration 
     * @param {Boolean} isPause
     */
    constructor(duration, isPause) {
        const me = this;

        me._duration = duration;
        me._remain = 0;
        me._isPause = isPause;
        me._finishTime = new Date().getTime() + me._duration;
    }


    /**
     * @returns {Boolean}
     */
    check() {
        const me = this;

        if (me._isPause)
            return false;

        const time = new Date().getTime();
        return time >= me._finishTime;
    }

    /**
     */
    reset() {
        const me = this;

        me.resume();
        me._finishTime = new Date().getTime() + me._duration;
    }

    /**
     */
    pause() {
        const me = this;

        me._isPause = true;
        me._remain = me._finishTime - new Date().getTime();
    }

    /**
     */
    resume() {
        const me = this;

        me._isPause = false;
        me._finishTime = new Date().getTime() + me._remain;
        me._remain = 0;
    }

    /**
     * @returns {Number}
     */
    getRemain() {
        const me = this;

        return me._isPause
            ? me._remain
            : me._finishTime - new Date().getTime();
    }
}