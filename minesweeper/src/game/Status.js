export default class Status {

    /** @type {Boolean} */
    _isBusy;

    /** @type {Number} */
    level;

    constructor(level) {
        const me = this;

        me.level = level;
    }
}