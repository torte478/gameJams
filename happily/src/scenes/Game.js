import Phaser from '../lib/phaser.js';

import Core from '../game/Core.js';
import Utils from '../game/Utils.js';
import Consts from '../game/Consts.js';

export default class Game extends Phaser.Scene {

	/** @type {Core} */
	_core;

    constructor() {
        super('game');
    }

    preload() {
        const me = this;

        me.load.tilemapCSV('level0', 'assets/level0.csv');

        Utils.loadImage(me, 'background');

        Utils.loadSpriteSheet(me, 'tiles', Consts.Unit.Small);
        Utils.loadSpriteSheet(me, 'player', Consts.Unit.Big);
    }

    create() {
        const me = this;

        me._core = new Core(me);
    }

    update() {
        const me = this;

        me._core.update();
    }
}