import Phaser from '../lib/phaser.js';

import Cameras from '../game/Cameras.js';
import Clock from '../game/Clock.js';
import Consts from '../game/Consts.js';
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

    /** @type {Cameras} */
    cameras;

    /** @type {Clock} */
    clock;

    constructor() {
        super('game');
    }

    preload() {
        const me = this;

        me.load.image('background_0_0', 'assets/background_0_0.png');
        me.load.image('background_0_1', 'assets/background_0_1.png');
        me.load.image('background_0_2', 'assets/background_0_2.png');
        me.load.image('background_0_3', 'assets/background_0_3.png');
        me.load.image('background_1_0', 'assets/background_1_0.png');
        me.load.image('background_1_1', 'assets/background_1_1.png');
        me.load.image('background_1_2', 'assets/background_1_2.png');
        me.load.image('background_1_3', 'assets/background_1_3.png');
        me.load.image('background_2_0', 'assets/background_2_0.png');
        me.load.image('background_2_1', 'assets/background_2_1.png');
        me.load.image('background_2_2', 'assets/background_2_2.png');
        me.load.image('background_2_3', 'assets/background_2_3.png');
        me.load.image('background_3_0', 'assets/background_3_0.png');
        me.load.image('background_3_1', 'assets/background_3_1.png');
        me.load.image('background_3_2', 'assets/background_3_2.png');
        me.load.image('background_3_3', 'assets/background_3_3.png');

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

        me.keyboard = new Keyboard(me.input.keyboard);
        me.keyboard.emitter.on('keyDown', me.onKeyDown, me);

        me.player = new Player(
            me,
            // TODO : to point
            Consts.playerSpawn.x,
            Consts.playerSpawn.y,
            me.add.sprite(0, 0, 'player'),
            me.add.sprite(0, 0, 'player_hands'),
            me.keyboard);

        me.timeline = new Timeline(Consts.duration);

        me.cameras = new Cameras(me);

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
        me.clock.update(me.timeline.current);

        if (me.debug) {
            me.log.text = 
                `pos: ${me.player.container.x | 0} ${me.player.container.y | 0}\n` +
                `time: ${(me.timeline.current).toFixed(1)} (${(me.timeline.remain).toFixed(1)})`;
        }
    }

    /**
     * @param {String} key 
     * @param {Boolean} just 
     */
    onKeyDown(key, just) {
        const me = this;

        if (me.debug) {
            if (key === '1' && just) {
                me.player.donkey = !me.player.donkey;
            }
        }
    }
}