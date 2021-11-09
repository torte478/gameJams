export default class Timeline {

    /** @type {Number} */
    duration;

    /** @type {Number} */
    start;

    /** @type {Number} */
    current;

    /** @type {Number} */
    remain;

    /**
     * @param {Number} duration 
     */
    constructor(duration) {
        const me = this;

        me.duration = duration;
        me.start = new Date().getTime();

        me.update();
    }

    update() {
        const me = this;

        me.current = (new Date().getTime() - me.start) / 1000;
        me.remain = me.duration - me.current;
    }
}