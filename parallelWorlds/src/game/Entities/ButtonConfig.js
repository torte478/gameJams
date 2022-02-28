export default class ButtonConfig {

    /** @type {Boolean} */
    isPushed;

    /** @type {Number[]} */
    doorsToOpen;

    /** @type {Number[]} */
    doorsToClose;

    /** @type {Number[]} */
    buttonsToPush;

    /** @type {Number[]} */
    buttonsToPull;

    constructor() {
        const me = this;

        me.isPushed = false;
        me.doorsToOpen = [];
        me.doorsToClose = [];
        me.buttonsToPush = [];
        me.buttonsToPull = [];
    }
}