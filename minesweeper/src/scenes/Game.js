import Phaser from '../lib/phaser.js';

import Animation from '../game/utils/Animation.js';
import Utils from '../game/utils/Utils.js';

import Core from '../game/Core.js';
import Consts from '../game/Consts.js';
import Config from '../game/Config.js';

export default class Game extends Phaser.Scene {

	/** @type {Core} */
	_core;

    constructor() {
        super('game');
    }

    init(data) {
        const me = this;

        me._levelIndex = data.level != undefined ? data.level : Config.StartLevelIndex;
        me._startTime = data.startTime != undefined ? data.startTime : new Date().getTime();

        Utils.debugLog('time: ' + (new Date().getTime() - me._startTime));
    }

    preload() {
        const me = this;

        Utils.loadImage(me, 'minesweeper_background');
        Utils.loadImage(me, 'city_background');
        Utils.loadImage(me, 'fade');

        Utils.loadSpriteSheet(me, 'cells', Consts.Unit);
        Utils.loadSpriteSheet(me, 'soldiers', Consts.Unit);
        Utils.loadSpriteSheet(me, 'items', Consts.Unit);
        Utils.loadSpriteSheet(me, 'explosions', Consts.UnitMiddle);
        Utils.loadSpriteSheet(me, 'clock', Consts.UnitMiddle);
        Utils.loadSpriteSheet(me, 'citizens', Consts.Unit);
        Utils.loadSpriteSheet(me, 'mine_hud', 110, 55);

        Utils.loadWav(me, 'action_start');
        Utils.loadWav(me, 'action_end');
        Utils.loadWav(me, 'empty_cell');
        Utils.loadWav(me, 'explosion');
        Utils.loadWav(me, 'shot');
        Utils.loadWav(me, 'hurt');

        Utils.loadMp3(me, 'win');
        Utils.loadMp3(me, 'lose');
        Utils.loadMp3(me, 'city_theme');
        Utils.loadMp3(me, 'mine_theme');
        Utils.loadMp3(me, 'ending');

        for (let i = 1; i <= 8; ++i)
            Utils.loadWav(me, `mine_detect_${i}`);
    }

    create() {
        const me = this;

        Animation.init(me);

        me._core = new Core(me, me._levelIndex, me._startTime);
        me.input.keyboard.on('keydown', me._core.onKeyDown, me._core);
    }

    update() {
        const me = this;

        me._core.update();
    }
}