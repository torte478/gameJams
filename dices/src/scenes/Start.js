import Phaser from '../lib/phaser.js';

import Core from '../game/Core.js';
import Animation from '../game/Animation.js';
import Utils from '../game/Utils.js';
import Consts from '../game/Consts.js';
import Config from '../game/Config.js';

export default class Start extends Phaser.Scene {

	/** @type {Core} */
	_core;

    constructor() {
        super('start');
    }

    preload() {
        const me = this;

        Utils.loadImage(me, 'background');
        Utils.loadSpriteSheet(me, 'dice', 128);
    }

    create() {
        const me = this;

        me.add.image(Consts.Viewport.Width / 2, Consts.Viewport.Height / 2, 'background')
            .setDepth(Consts.Depth.Background)
            .setScrollFactor(0);

        const text = me.add.text(
            128,
            98,
            'WEIRD DICE GAME',
            { fontFamily: 'Arial Black', fontSize: 72, color: '#abbaca' }
        );
        //
        text.setStroke('#fcf8ff', 10);
        text.setShadow(2, 2, "#333333", 2, true, true);

        const text2 = me.add.text(
            340,
            300,
            'CHOOSE DIFFICULTY',
            { fontFamily: 'Arial Black', fontSize: 32, color: '#645b6a' }
        );
        text2.setShadow(2, 2, "#333333", 2, true, true);

        for (let i = 0; i < 6; ++i) {

            const x = 375 + (i % 3) * 150;
            const y = 450 + Math.floor(i / 3) * 125;

            const button = me.add.sprite(x, y, 'dice', i).setScale(0.5).setInteractive();

            button
                .on('pointerdown', () => { 
                    me.scene.start('game', { level: i } )
                 })
                .on('pointermove', () => { button.setScale(1) })
                .on('pointerout', () => { button.setScale(0.5) });
        }
    }

    update() {
        const me = this;
    }

    _onPointerDown(pointer) {
        const me = this;
    }

    _onKeyDown(event) {
        const me = this;
    }
}