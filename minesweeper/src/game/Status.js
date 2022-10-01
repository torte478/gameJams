export default class Status {

    /** @type {Boolean} */
    _isBusy;

    /** @type {Number} */
    level;

    constructor(level) {
        const me = this;

        me.level = level;
    }

    busy() {
        const me = this;

        if (me._isBusy)
            throw 'status is already BUSY!';

        me._isBusy = true;
    }

    free() {
        const me = this;

        if (!me._isBusy)
            throw 'status is already FREE!';

        me._isBusy = false;
    }
}