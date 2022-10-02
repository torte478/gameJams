import Config from './Config.js';

export default class Status {

    /** @type {Boolean} */
    isBusy;

    /** @type {Number} */
    level;

    /** @type {Boolean} */
    isCity;

    constructor(level) {
        const me = this;

        me.level = level;
        me.isCity = Config.Levels[level].StartInCity;
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