import Phaser from '../lib/phaser.js';

import Here from '../framework/Here.js';
import Consts from './Consts.js';

export default class SignalBox {

    /** @type {Phaser.GameObjects.Image} */
    _box;

    /** @type {Phaser.GameObjects.Container} */
    _container;

    /** @type {Phaser.GameObjects.Text} */
    _text;

    /**
     * 
     * @param {Number} y 
     * @param {String} signal 
     */
    constructor(y, signal) {
        const me = this;

        me._box = Here._.add.image(0, 0, 'signal_box');
        me._text = Here._.add.text(0, 0, signal.toUpperCase(), {
            fontFamily: 'Arial Black',
            fontSize: 96,
            color: '#F0E2E1'
        })
            .setOrigin(0.5)
            .setStroke('#4A271E', 16);

        me._container = Here._.add.container(0, y, [
                me._box,
                me._text
            ])
            .setDepth(Consts.Depth.GUI_TAPE);
    }

    /**
     * @returns {Phaser.GameObjects.Container}
     */
    getGameObject() {
        const me = this;

        return me._container;
    }

    setText(text) {
        const me = this;

        me._box.clearTint();
        me._text.setText(text);
    }

    setTint(isCorrect) {
        const me = this;

        me._box.setTint(
            isCorrect ? 0x42B300 : 0xCA0050);
    }
}
