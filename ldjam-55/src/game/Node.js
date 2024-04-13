export default class Node {

    /** @type {Number} */
    cell;

    /** @type {Number} */
    x;

    /** @type {Number} */
    y;

    /** @type {Number[]} */
    paths = [];

    /** @type {Phaser.GameObjects.Image} */
    passenger = null;

    /** @type {Number} */
    _lease = null;

    isFree(index) {
        return !this.passenger && (!this._lease || this._lease == index);
    }

    lease(id) {
        const me = this;

        me._lease = id;
    }

    release() {
        const me = this;

        me._lease = null;
    }
}