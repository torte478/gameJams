import Phaser from '../lib/phaser.js';
import Enums from './Enums.js';

export default class Cell {

    /** @type {Phaser.GameObjects.Sprite} */
    _sprite;

    /**
     * 
     * @param {Phaser.Scene} scene 
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} index
     * @param {Boolean} isOpen 
     * @param {Function} callback 
     * @param {Object} context 
     */
    constructor(scene, index, x, y, isOpen, frame, callback, context) {
        const me = this;

        me._sprite = scene.add.sprite(x, y, 'cells', isOpen ? frame : Enums.Cell.Unknown)
            .setInteractive();

        me._sprite.on('pointerdown', () => { callback(index) }, context);
    }

    toGameObject() {
        const me = this;

        return me._sprite;
    }
}