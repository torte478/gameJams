import Phaser from '../lib/phaser.js';

import Core from '../game/Core.js';

export default class Game extends Phaser.Scene {

	/** @type {Core} */
	_core;

    constructor() {
        super('game');
    }

    preload() {
        const me = this;
    }

    create() {
        const me = this;

        me._core = new Core(me);
    }

    update() {
        const me = this;
    }
}