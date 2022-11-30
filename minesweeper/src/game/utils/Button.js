import Phaser from '../../lib/phaser.js';

import Audio from './Audio.js';
import ButtonConfig from './ButtonConfig.js';

export default class Button {

    /** @type {Phaser.Scene} */
    _scene;

    /** @type {ButtonConfig} */
    _config;

    /** @type {Audio} */
    _audio;

    /** @type {Phaser.GameObjects.Container} */
    _container;

    /** @type {Phaser.GameObjects.Sprite} */
    _sprite;

    /** @type {Boolean} */
    _isClicked;

    /**
     * 
     * @param {Phaser.Scene} scene 
     * @param {Audio} audio 
     * @param {ButtonConfig} config 
     */
    constructor(scene, audio, config) {
        const me = this;

        me._scene = scene;
        me._config = config;
        me._audio = audio;
        me._isClicked = false;

        me._sprite = scene.add.sprite(0, 0, config.texture, config.frameIdle)
            .setScale(1.5);
        const children = [ me._sprite ];

        if (!!config.text) {
            const text = scene.add.text(0, 0, config.text, config.textStyle)
                .setOrigin(0.5, 0.5);

            children.push(text);
        }

        var bounds = me._sprite.getBounds();
        me._container = scene.add.container(config.x, config.y, children)
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
        me._scene.time.delayedCall(500, () => { 
            me._container.setScale(1) 
            me._isClicked = false;
        }, me);

        if (!!me._config.sound)
            me._audio.play(me._config.sound);

        me._scene.time.delayedCall(
            200, 
            me._config.callback, 
            me._config.callbackScope);
    }

    _select() {
        const me = this;

        if (me._config.frameSelected !== null)
            me._sprite.setFrame(me._config.frameSelected);

        me._sprite.setScale(2);
    }

    _unselect() {
        const me = this;

        if (me._config.frameIdle !== null)
            me._sprite.setFrame(me._config.frameIdle);

        me._sprite.setScale(1.5);
    }
}