import Phaser from '../lib/phaser.js';

import Animation from '../game/utils/Animation.js';
import Utils from '../game/utils/Utils.js';

import Core from '../game/Core.js';
import Consts from '../game/Consts.js';

export default class Game extends Phaser.Scene {

	/** @type {Core} */
	_core;

    constructor() {
        super('game');
    }

    preload() {
        const me = this;

        Utils.runLoadingBar(this);

        me.load.tilemapCSV('level', `assets/level.csv`);

        Utils.loadSpriteSheet(me, 'main', Consts.Unit);
        Utils.loadSpriteSheet(me, 'tilemap', Consts.Unit);
        Utils.loadSpriteSheet(me, 'big', Consts.Unit * 2);
        Utils.loadSpriteSheet(me, 'player', Consts.Unit, Consts.Unit * 2);
        Utils.loadSpriteSheet(me, 'gun', Consts.Unit * 2, Consts.Unit);
        Utils.loadSpriteSheet(me, 'square', Consts.Unit * 2);
        Utils.loadImage(me, 'enemy_catcher');

        Utils.loadWav(me, 'button_click');
    }

    create() {
        const me = this;

        Animation.init(me);

        me._core = new Core(me);
    }

    update(time, delta) {
        const me = this;

        me._core.update(delta);
    }
}