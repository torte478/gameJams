import Phaser from '../lib/phaser.js';

import CameraViews from '../game/CameraViews.js';
import Clock from '../game/Clock.js';
import Consts from '../game/Consts.js';
import {Rectangle} from '../game/Geometry.js';
import Keyboard from '../game/Keyboard.js';
import Player from '../game/Player.js';
import Timeline from '../game/Timeline.js';

export default class Game extends Phaser.Scene {

    /** @type {Boolean} */
    debug = true;

    /** @type {Player} */
    player;

    /** @type {Keyboard} */
    keyboard;

    /** @type {Phaser.GameObjects.Text} */
    log;

    /** @type {Timeline} */
    timeline;

    /** @type {CameraViews} */
    cameraViews;

    /** @type {Clock} */
    clock;

    constructor() {
        super('game');
    }

    preload() {
        const me = this;

        if (Consts.renderClock) {
            for (let i = 0; i < Consts.backgroundCount; ++i) 
            for (let j = 0; j < Consts.backgroundCount; ++j) {
                const name = `background_${i}_${j}`;
                me.load.image(name, `assets/${name}.png`);
            }

            for (let i = 0; i < Consts.arrowCountY; ++i)
            for (let j = 0; j < Consts.arrowCountX; ++j) {
                const name = `arrows_${i}_${j}`;
                me.load.image(name, `assets/${name}.png`);
            }
        }

        me.load.spritesheet('player', 'assets/player.png', {
            frameWidth: 64,
            frameHeight: 64
        });
        me.load.image('player_hands', 'assets/player_hands.png');

        me.cursorKeys = this.input.keyboard.createCursorKeys();
    }

    create() {
        const me = this;

        me.clock = new Clock(me);

        if (Consts.renderClock) {
            me.clock.addTiles(
                Consts.backgroundCount, 
                Consts.backgroundCount,
                Consts.backgroundSize, 
                'background',
                0);

            me.clock.addTiles(
                Consts.arrowCountX,
                Consts.arrowCountY,
                Consts.backgroundSize,
                'arrows',
                1000);
        }

        me.keyboard = new Keyboard(me.input.keyboard);
        me.keyboard.emitter.on('keyDown', me.onKeyDown, me);

        me.player = new Player(
            me,
            Consts.playerSpawn,
            me.add.sprite(0, 0, 'player'),
            me.add.sprite(0, 0, 'player_hands'),
            me.keyboard);

        me.timeline = new Timeline(Consts.duration, Consts.startTime);

        me.cameraViews = new CameraViews(me, Consts.enableSecondCamera);

        if (me.debug) {
            me.log = me.add.text(10, 10, 'Debug', {
                fontSize: 14
            })
                .setScrollFactor(0);
        }
    }

    update() {
        const me = this;

        me.timeline.update();
        me.player.update();
        me.keyboard.update();
        me.clock.update(
            me.timeline.current,
            me.convertMainCameraToRectangle());

        if (me.timeline.current >= Consts.gameOverTime) {
            me.scene.start('game_over');
        }

        if (me.debug) {
            me.log.text = 
                `pos: ${me.player.container.x | 0} ${me.player.container.y | 0}\n` +
                `time: ${(me.timeline.current).toFixed(1)} (${(me.timeline.remain).toFixed(1)})`;
        }
    }

    convertMainCameraToRectangle() {
        const me = this;
        const camera = me.cameraViews.main;

        return Rectangle.build(
            new Phaser.Geom.Point(
                camera.scrollX - Consts.cameraOffset,
                camera.scrollY - Consts.cameraOffset),
            new Phaser.Geom.Point(
                camera.scrollX + camera.width + Consts.cameraOffset,
                camera.scrollY + camera.height + Consts.cameraOffset)
            );
    }

    /**
     * @param {String} key 
     */
    onKeyDown(key) {
        const me = this;

        if (me.debug) {
            if (key === '1') {
                me.player.donkey = !me.player.donkey;
            }

            if (key === '2') {
                me.scene.pause();
            }
        }
    }
}