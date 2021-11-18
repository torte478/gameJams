import Phaser from '../lib/phaser.js';

import Actions from '../game/Actions.js';
import Bot from '../game/Bot.js';
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

    /** @type {Array} */
    bots;

    constructor() {
        super('game');
    }

    preload() {
        const me = this;

        if (Consts.renderClock) {
            for (let i = 0; i < Consts.backgroundCount; ++i) 
            for (let j = 0; j < Consts.backgroundCount; ++j) {
                const name = `bg_${i}_${j}`;
                me.load.image(name, `assets/background/${name}.png`);
            }

            // for (let i = 0; i < Consts.arrowCountY; ++i)
            // for (let j = 0; j < Consts.arrowCountX; ++j) {
            //     const name = `arrows_${i}_${j}`;
            //     me.load.image(name, `assets/${name}.png`);
            // }
        }

        me.load.spritesheet('player', 'assets/player.png', {
            frameWidth: 64,
            frameHeight: 64
        });
        me.load.image('player_hands', 'assets/player_hands.png');

        me.load.tilemapCSV('main_tilemap_map', 'assets/main_tilemap.csv');
        me.load.tilemapCSV('secret_tilemap_map', 'assets/secret_tilemap.csv');
        me.load.tilemapCSV('desert_tilemap_map', 'assets/desert_tilemap.csv');
        me.load.image('main_tilemap', 'assets/main_tilemap.png');

        me.load.spritesheet('bot_cit_0', 'assets/bot_cit_0.png', {
            frameWidth: 64,
            frameHeight: 64
        });

        me.load.image('guard', 'assets/guard.png');
        me.load.image('king', 'assets/king.png');
    }

    create() {
        const me = this;

        me.clock = new Clock(me);

        if (Consts.renderClock) {
            me.clock.addTiles(
                Consts.backgroundCount, 
                Consts.backgroundCount,
                Consts.backgroundSize, 
                'bg',
                0);

            // me.clock.addTiles(
            //     Consts.arrowCountX,
            //     Consts.arrowCountY,
            //     Consts.backgroundSize,
            //     'arrows',
            //     1000);
        }

        me.keyboard = new Keyboard(me.input.keyboard);
        me.keyboard.emitter.on('keyDown', me.onKeyDown, me);

        const city = me.createTilemap('main_tilemap_map', Consts.cityStartY);
        const secret = me.createTilemap('secret_tilemap_map', Consts.secretStartY);
        const desert = me.createTilemap('desert_tilemap_map', Consts.desertStartY);

        me.anims.create({
            key: 'bot_cit_0_walk',
            frames: me.anims.generateFrameNumbers('bot_cit_0', { frames: [ 0, 1, 2, 3 ] }),
            frameRate: 4,
            repeat: -1,
        });

        me.anims.create({
            key: 'bot_cit_0_dance',
            frames: me.anims.generateFrameNumbers('bot_cit_0', { frames: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13 ] }),
            frameRate: 8,
            repeat: -1,
        });

        me.bots = 
        [
            new Bot(
                me, 
                'bot_cit_0',   
                [
                    { x: -288, y: -4618},
                    { action: Actions.DANCE },
                    { x: 288, y: -4618},
                    { action: Actions.DANCE },
                    { x: 0, y: -4618},
                    { x: 0, y: -5034},
                    { x: -288, y: -5034},
                    { x: 288, y: -5034},
                    { x: 0, y: -5034},
                    { x: 0, y: -4618}
                ])
        ]

        me.add.image(-40, -5674, 'guard');
        me.add.image(40, -5674, 'guard').setFlipX(true);

        me.add.image(0, -1152, 'king');

        me.player = new Player(
            me,
            Consts.playerSpawn,
            me.add.sprite(0, 0, 'player'),
            me.add.sprite(0, 0, 'player_hands'),
            me.keyboard);

        me.timeline = new Timeline(Consts.duration, Consts.startTime);

        me.cameraViews = new CameraViews(me, Consts.enableSecondCamera);

        me.physics.add.collider(me.player.container, city);

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
        me.cameraViews.update();
        me.keyboard.update();
        me.clock.update(
            me.timeline.current,
            me.convertMainCameraToRectangle());

        me.bots.forEach((bot) => bot.update());

        if (me.timeline.current >= Consts.gameOverTime) {
            me.scene.start('game_over');
        }

        if (me.debug) {
            me.log.text = 
                `${me.player.container.x | 0} ${me.player.container.y | 0}\n` + 
                `${me.player.container.x / Consts.unit | 0} ${me.player.container.y / Consts.unit | 0}\n` +
                `${(me.player.container.x / Consts.unit | 0) * Consts.unit} ${(me.player.container.y / Consts.unit | 0) * Consts.unit}\n` +
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

    /**
     * 
     * @param {String} name 
     * @param {Numer} startY 
     * @returns {Phaser.Tilemaps.TilemapLayer}
     */
    createTilemap(name, startY) {
        const me = this;

        const map = me.make.tilemap({
            key: name,
            tileWidth: Consts.unit,
            tileHeight: Consts.unit
        });

        const image = map.addTilesetImage('main_tilemap');
        const layer = map.createLayer(
            0,
            image,
            Consts.levelStartX,
            startY
        );

        map.setCollisionBetween(1, 7);
        map.setCollisionBetween(9, 10);
        map.setCollisionBetween(12, 13);
        map.setCollisionBetween(17, 18);
        map.setCollisionBetween(28, 29);
        map.setCollisionBetween(36, 37);

        return layer;
    }
}