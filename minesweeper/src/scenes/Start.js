import Phaser from '../lib/phaser.js';

import Utils from '../game/utils/Utils.js';

import Core from '../game/Core.js';
import Consts from '../game/Consts.js';
import ButtonConfig from '../game/utils/ButtonConfig.js';
import Button from '../game/utils/Button.js';
import Audio from '../game/utils/Audio.js';

export default class Start extends Phaser.Scene {

	/** @type {Core} */
	_core;

    constructor() {
        super('start');
    }

    preload() {
        const me = this;

        Utils.loadSpriteSheet(me, 'dance', 110, 110);
        Utils.loadImage(me, 'menu_back')
        Utils.loadSpriteSheet(me, 'cells', 55);
        Utils.loadMp3(me, 'city_theme');
        Utils.loadWav(me, 'action_start');
    }

    init(data) {
        const me = this;

        me._startTime = data.startTime != undefined ? data.startTime : new Date().getTime();

        Utils.debugLog('time: ' + (new Date().getTime() - me._startTime));
    }

    create() {
        const me = this;

        me.anims.create({
            key: 'dance',
            frames: me.anims.generateFrameNames('dance', { frames: [ 0, 1, 2, 1, 2, 3, 4, 0, 4 ] }),
            frameRate: 6,
            repeat: -1
        });

        me.add.image(Consts.Viewport.Width / 2, Consts.Viewport.Height / 2, 'menu_back');
        const audio = new Audio(me);

        for (let i = 0; i < 3; ++i) {
            const config = new ButtonConfig();
            config.x = 320 + i * 200;
            config.y = 550;
            config.texture = 'cells';
            config.frameIdle = i + 1;
            config.frameSelected = i + 1;
            config.callback = () => { me._onButtonClick(i) };
            config.callbackScope = me;
            config.sound = 'action_start';

            new Button(me, audio, config);
        }

        const first = me.add.sprite(100, 600, 'dance')
            .play('dance');

        const second = me.add.sprite(Consts.Viewport.Width - 100, 600, 'dance')
            .play('dance')
            .setFlipX(true);

        me._theme = me.sound.add('city_theme', { volume: 0.25, loop: true });
        me._theme.play();
    }

    _onButtonClick(i) {
        const me = this;

        me._theme.stop();
        me.scene.start('game', { level: i, startTime: me._startTime });
    }
}