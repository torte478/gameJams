import Phaser from '../lib/phaser.js';

import Consts from '../game/Consts.js';
import Keyboard from '../game/Keyboard.js';
import Player from '../game/Player.js';

export default class Game extends Phaser.Scene {

    /** @type {Boolean} */
    debug = true;

    /** @type {Player} */
    player;

    /** @type {Phaser.Types.Input.Keyboard.CursorKeys} */
    cursorKeys;

    /** @type {Keyboard} */
    keyboard;

    constructor() {
        super('game');
    }

    preload() {
        this.load.spritesheet('player', 'assets/player.png', {
            frameWidth: 64,
            frameHeight: 64
        });
        this.load.image('background', 'assets/background.png');
        this.load.image('player_hands', 'assets/player_hands.png');

        this.cursorKeys = this.input.keyboard.createCursorKeys();
    }

    create() {
        const me = this;
        me.add.image(512, 368, 'background');

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
    }

    update() {
        const me = this;

        me.player.update();
        me.keyboard.update();
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