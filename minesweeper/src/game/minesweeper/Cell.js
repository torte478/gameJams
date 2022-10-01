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
    _isMine;

    /** @type {Boolean} */
    _isExploded;

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
        me._isMine = false;
        me._isExploded = false;

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
        if (me._isOpen)
            me._sprite.setFrame(content);
    }

    open() {
        const me = this;

        if (me._isOpen)
            return;

        me._sprite.setFrame(me._content);
        me._isOpen = true;
    }

    isOpen() {
        const me = this;

        return me._isOpen;
    }

    canExplode() {
        const me = this;

        return me._isMine && !me._isExploded;
    }

    setMine() {
        const me = this;

        me._isMine = true;
    }

    explode() {
        const me = this;

        me._isExploded = true;
        me._content = Enums.Cell.Exploded;
        me.open();
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