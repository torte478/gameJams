export default class Timeline {

    /** @type {Number} */
    duration;

    /** @type {Number} */
    start;

    /** @type {Number} */
    current;

    /** @type {Number} */
    remain;

    /** @type {Number} */
    offset;

    /**
     * @param {Number} duration 
     * @param {Number} startTime
     */
    constructor(duration, startTime) {
        const me = this;

        me.duration = duration;
        me.offset = startTime;
        me.start = new Date().getTime();

        me.update();
    }

    update() {
        const me = this;

        me.current = me.offset + (new Date().getTime() - me.start) / 1000;
        me.remain = me.duration - me.current;
    }
}