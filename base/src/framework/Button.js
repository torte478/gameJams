import Phaser from '../../lib/phaser.js';
import Here from './Here.js';

import ButtonConfig from "./ButtonConfig.js";

export default class Button {

    /** @type {ButtonConfig} */
    _config;

    /** @type {Phaser.GameObjects.Container} */
    _container;

    /** @type {Phaser.GameObjects.Sprite} */
    _sprite;

    /** @type {Boolean} */
    _isClicked;

    /**
     * @param {ButtonConfig} config 
     */
    constructor(config) {
        const me = this;

        me._config = config;
        me._isClicked = false;

        me._sprite = Here._.add.sprite(0, 0, config.texture, config.frameIdle);
        const children = [ me._sprite ];

        if (!!config.text) {
            const text = Here._.add.text(0, 0, config.text, config.textStyle)
                .setOrigin(0.5, 0.5);

            children.push(text);
        }

        var bounds = me._sprite.getBounds();
        me._container = Here._.add.container(config.x, config.y, children)
            .setSize(bounds.width, bounds.height)
            .setInteractive();

        me._container.on('pointerdown', me._onButtonClick, me);
        me._container.on('pointerover', me._select, me);
        me._container.on('pointerout', me._unselect, me);
    }

    _onButtonClick() {
        const me = this;

        if (me._isClicked)
            return;

        me._container.setScale(0.75);
        me._isClicked = true;
        Here._.time.delayedCall(500, () => { 
            me._container.setScale(1) 
            me._isClicked = false;
        }, me);

        if (!!me._config.sound)
            Here.Audio.play(me._config.sound);

        Here._.time.delayedCall(
            200, 
            me._config.callback, 
            me._config.callbackScope);
    }

    _select() {
        const me = this;

        if (me._config.frameSelected !== null)
            me._sprite.setFrame(me._config.frameSelected);
    }

    _unselect() {
        const me = this;

        if (me._config.frameIdle !== null)
            me._sprite.setFrame(me._config.frameIdle);
    }
}