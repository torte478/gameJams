export default class Status {

    /** @type {Boolean} */
    isBusy;

    /** @type {Number} */
    level;

    constructor(level) {
        const me = this;

        me.level = level;
    }

    busy() {
        const me = this;

        if (me.isBusy)
            throw 'status is already BUSY!';

        me.isBusy = true;
    }

    free() {
        const me = this;

        if (!me.isBusy)
            throw 'status is already FREE!';

        me.isBusy = false;
    }
}