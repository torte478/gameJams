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

    isFree() {
        return !this.passenger;
    }
}