import Phaser from '../lib/phaser.js';
import Here from './Here.js';

import ButtonConfig from "./ButtonConfig.js";

export default class Button {

    /** @type {ButtonConfig} */
    _config;

    /** @type {Boolean} */
    _isClicked;

    /** @type {Phaser.GameObjects.Text} */
    _text;

    /** @type {Phaser.GameObjects.Container} */
    _container;

    /**
     * @param {ButtonConfig} config 
     */
    constructor(config) {
        const me = this;

        me._config = config;
        me._isClicked = false;

        if (!config.text)
            throw 'text undefined';

        me._text = Here._.add.text(0, 0, config.text, config.textStyle)
            .setOrigin(0.5, 0.5);

        var bounds = me._text.getBounds();
        me._container = Here._.add.container(config.x, config.y, [me._text])
            .setSize(bounds.width, bounds.height)
            .setInteractive();

        me._container.on('pointerdown', me._onButtonClick, me);
        me._container.on('pointerover', me._select, me);
        me._container.on('pointerout', me._unselect, me);
    }

    getGameObject() {
        const me = this;

        return me._container;
    }

    _onButtonClick() {
        const me = this;

        if (me._isClicked)
            return;

        me._container.setScale(0.5);
        me._isClicked = true;
        Here._.time.delayedCall(2000, () => { 
            me._container.setScale(1) 
            me._isClicked = false;
        }, me);

        Here.Audio.play('button_click');

        Here._.time.delayedCall(
            200, 
            me._config.callback,
            [], 
            me._config.callbackScope);
    }

    _select() {
        const me = this;

        if (!me._isClicked)
            me._container.setScale(1.25);
    }

    _unselect() {
        const me = this;

        if (!me._isClicked)
            me._container.setScale(1);
    }
}