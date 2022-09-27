import Phaser from '../lib/phaser.js';

import Core from '../game/Core.js';
import Animation from '../game/Animation.js';
import Utils from '../game/Utils.js';

export default class Game extends Phaser.Scene {

	/** @type {Core} */
	_core;

    constructor() {
        super('game');
    }

    preload() {
        const me = this;

        Utils.loadWav(me, 'button_click');
    }

    create() {
        const me = this;

        Animation.init(me);

        me._core = new Core(me);
    }

    update() {
        const me = this;

        me._core.update();
    }
}