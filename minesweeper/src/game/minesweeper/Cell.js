import Phaser from '../../lib/phaser.js';
import Enums from '../Enums.js';

export default class Cell {

    /** @type {Phaser.GameObjects.Sprite} */
    _sprite;

    /** @type {Number} */
    _content;

    /** @type {Boolean} */
    _isOpen;

    /** @type {Boolean} */
    isMine;

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

        me._content = frame;
        me._isOpen = isOpen;
        me.isMine = false;

        me._sprite = scene.add.sprite(x, y, 'cells', isOpen ? frame : Enums.Cell.Unknown)
            .setInteractive();

        me._sprite.on('pointerdown', () => { callback.call(context, index) });
        me._sprite.on('pointerover', me._select, me);
        me._sprite.on('pointerout', me._unselect, me);
    }

    /** @type {Phaser.GameObjects.GameObject} */
    toGameObject() {
        const me = this;

        return me._sprite;
    }

    /** @type {Number} */
    setContent(content) {
        const me = this;

        me._content = content;
        if (me.isOpen)
            me._sprite.setFrame(content);
    }

    _select() {
        const me = this;

        me._sprite.setTint(0x00ff00);
        me._sprite.setAlpha(0.5);
    }

    _unselect() {
        const me = this;

        me._sprite.clearTint()
        me._sprite.setAlpha(1);
    }
}