import Phaser from '../lib/phaser.js';

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

    constructor() {
        super('game');
    }

    preload() {
        const me = this;

        me.load.spritesheet('player', 'assets/player.png', {
            frameWidth: 64,
            frameHeight: 64
        });
        me.load.image('background', 'assets/background.png');
        me.load.image('player_hands', 'assets/player_hands.png');

        me.cursorKeys = this.input.keyboard.createCursorKeys();
    }

    create() {
        const me = this;

        me.add.image(0, 0, 'background');
        me.add.image(0, -768, 'background');
        me.add.image(0, 768, 'background');

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

        me.cameras.main.startFollow(me.player.container);
        me.cameras.main.setDeadzone(1024); // TODO

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

        if (me.debug) {
            me.log.text = 
                `pos: ${me.player.container.x | 0} ${me.player.container.y | 0}\n` +
                `time: ${(me.timeline.current / 1000).toFixed(1)} (${(me.timeline.remain / 1000).toFixed(1)})`;
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