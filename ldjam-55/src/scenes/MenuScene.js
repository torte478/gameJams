import Animation from '../framework/Animation.js';
import Button from '../framework/Button.js';
import Here from '../framework/Here.js';
import HereScene from '../framework/HereScene.js';
import Utils from '../framework/Utils.js';

import Game from '../game/Game.js';

export default class MenuScene extends HereScene {

    /** @type {Boolean} */
    _isRestart;

    constructor() {
        super('menuScene');
    }

    init(data) {
        const me = this;

        me._isRestart = !!data.isRestart;
    }

    preload() {
        super.preload();
        const me = this;

        if (!me._isRestart)
            Utils.runLoadingBar();

        Utils.loadImage('logo');
        Utils.loadImage('mainSmoke');
        Utils.loadMp3('mainTheme');
        Utils.loadImage('startButton');
    }

    create() {
        const me = this;

        Here._.add.image(500, 200, 'logo');
        const smoke = Here._.add.image(0, 900, 'mainSmoke').setScale(2);
        Here._.add.tween({
            targets: smoke,
            x: 1000,
            duration: 30000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
        Here.Audio.play('mainTheme', { volume: 0.75});

        new Button({
            x: 500,
            y: 450,
            texture: 'startButton',
            tintPress: 0xffb100,
            tintSelected: 0xffb100,
            callback:() => {
                Here.Audio.stopAll();
                Here._.scene.start('gameScene');
            }
        })
    }

    update(time, delta) {
        super.update();

        const me = this;
    }
}