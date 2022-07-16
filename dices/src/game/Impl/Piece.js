import Phaser from '../../lib/phaser.js';

export default class Piece {

    /** @type {Phaser.GameObjects.Sprite} */
    _sprite;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Phaser.Geom.Point} position 
     * @param {Number} frame 
     */
    constructor(scene, position, frame) {
        const me = this;

        me._sprite = scene.add.sprite(position.x, position.y, 'piece', frame);
    }
}