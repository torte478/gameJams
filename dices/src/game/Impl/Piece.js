import Phaser from '../../lib/phaser.js';
import Cell from './Cell.js';

export default class Piece {

    /** @type {Phaser.GameObjects.Sprite} */
    _sprite;

    /** @type {Cell} */
    cell;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Cell} cell 
     * @param {Number} frame 
     * @param {Number} scale
     */
    constructor(scene, cell, frame, scale) {
        const me = this;

        me.cell = cell;

        me._sprite = scene.add
            .sprite(cell.x, cell.y, 'piece', frame)
            .setScale(scale);
    }
}