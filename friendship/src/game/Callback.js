export default class Callback {

    /** @type {Function} */
    _fn;

    /** @type {Object} */
    _context;

    constructor(fn, context) {
        const me = this;

        me._fn = fn;
        me._context = context;
    }

    call() {
        const me = this;

        if (!!me._fn)
            me._fn.call(me._context);
    }
}
