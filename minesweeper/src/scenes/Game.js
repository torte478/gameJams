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

        Utils.loadImage(me, 'minesweeper_background');
        Utils.loadImage(me, 'city_background');
        Utils.loadImage(me, 'mine_hud');

        Utils.loadSpriteSheet(me, 'cells', Consts.Unit);
        Utils.loadSpriteSheet(me, 'soldiers', Consts.Unit);
        Utils.loadSpriteSheet(me, 'items', Consts.Unit);
        Utils.loadSpriteSheet(me, 'explosions', Consts.UnitMiddle);
        Utils.loadSpriteSheet(me, 'clock', Consts.UnitMiddle);
        Utils.loadSpriteSheet(me, 'citizens', Consts.Unit);

        Utils.loadWav(me, 'button_click');
    }

    create() {
        const me = this;

        Animation.init(me);

        me._core = new Core(me);
        me.input.keyboard.on('keydown', me._core.onKeyDown, me._core);
    }

    update() {
        const me = this;

        me._core.update();
    }
}