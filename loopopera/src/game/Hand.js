import Here from "../framework/Here.js";

export default class Hand {

    /**
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} direction 
     * @param {Phaser.Physics.Arcade.Group} pool 
     */
    constructor(x, y, direction, pool) {
        const me = this;

        const sprite = Here._.physics.add.sprite(0, 0, 'hand', 7);
    }
}