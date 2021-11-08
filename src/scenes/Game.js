import Phaser from '../lib/phaser.js';

import Consts from '../game/Consts.js';
import Player from '../game/Player.js';

export default class Game extends Phaser.Scene {

    /** @type {Player} */
    player;

    /** @type {Phaser.Types.Input.Keyboard.CursorKeys} */
    cursorKeys;

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
        this.add.image(512, 368, 'background');

        this.player = new Player(
            this,
            Consts.playerSpawn.x,
            Consts.playerSpawn.y,
            this.add.sprite(0, 0, 'player'),
            this.add.sprite(0, 0, 'player_hands'));
    }

    update() {
        this.player.update(this.cursorKeys);
    }
}