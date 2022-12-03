export default class Callback {

    /** @type {Function} */
    fn;

    /** @type {Object} */
    context;

    constructor(fn, context) {
        const me = this;

        me.fn = fn;
        me.context = context;
    }

    call() {
        const me = this;

        if (!!me.fn)
            me.fn.call(me.context);
    }
}
