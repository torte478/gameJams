import Phaser from '../lib/phaser.js';

import Core from '../game/Core.js';
import Utils from '../game/Utils.js';
import Consts from '../game/Consts.js';
import Config from '../game/Config.js';

export default class Start extends Phaser.Scene {

	/** @type {Core} */
	_core;

    _levelIndex;

    constructor() {
        super('start');
    }

    preload() {
        const me = this;
        
        Utils.loadImage(me, 'main_title');
        Utils.loadSpriteSheet(me, 'buttons', 100);

        me.load.audio('medley', 'assets/sfx/medley.mp3');
        me.load.audio('restart', 'assets/sfx/restart.wav');
    }

    create() {
        const me = this;

        me.add.image(500, 400, 'main_title');
        if (!(Config.Debug.Global && Config.Debug.Music))
            me.sound.play('medley', { volume: 0.5, loop: true });

        const textStyle = { 
            fontFamily: 'Arial Black',
            fontSize: 36, 
            color: '#430064', 
        };

        for (let i = 0; i < 10; ++i) {

            const x = 200 + (i % 5) * 150;
            const y = 530 + Math.floor(i / 5) * 125;

            const button = me.add.sprite(x, y, 'buttons', 2).setInteractive();

            button
                .on('pointerdown', () => { 
                    me.sound.stopByKey('medley');
                    me.sound.play('restart', { volume: 0.5 });
                    me.scene.start('game', { level: i } ) })
                .on('pointermove', () => { button.setFrame(3) })
                .on('pointerout', () => { button.setFrame(2) });

            me.add.text(x, y, `${i + 1}`, textStyle).setOrigin(0.5);
        }

        me.add.text(500, 750, 'Use mouse to select level', { fontSize: 28 }).setOrigin(0.5);
    }

    update() {

    }
}