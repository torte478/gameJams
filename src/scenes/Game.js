import Phaser from '../lib/phaser.js';

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
        this.load.image('player', 'assets/player.png');

        this.cursorKeys = this.input.keyboard.createCursorKeys();
    }

    create() {
        this.player = new Player(
            this.physics.add.sprite(512, 368, 'player'));
    }

    update() {
        this.player.update(this.cursorKeys);
    }
}