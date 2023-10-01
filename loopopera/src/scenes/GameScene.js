import Animation from '../framework/Animation.js';
import HereScene from '../framework/HereScene.js';
import Utils from '../framework/Utils.js';
import Consts from '../game/Consts.js';

import Game from '../game/Game.js';

export default class GameScene extends HereScene {

	/** @type {Game} */
	_game;

    /** @type {Boolean} */
    _isRestart;

    constructor() {
        super('gameScene');
    }

    init(data) {
        const me = this;

        me._isRestart = !!data.isRestart;
    }

    preload() {
        super.preload();
        const me = this;

        if (!me._isRestart)
            Utils.runLoadingBar();

        me.load.tilemapCSV('level', `assets/level_Copy of Tile Layer 1.csv`);

        Utils.loadSpriteSheet('tiles', Consts.Unit.Normal);
        Utils.loadSpriteSheet('player', Consts.Unit.Big);
        Utils.loadSpriteSheet('items', Consts.Unit.Normal);
        Utils.loadSpriteSheet('hand', 100, 200);
        Utils.loadSpriteSheet('tree', 300, 300);
        Utils.loadSpriteSheet('boss', 500, 600);

        Utils.loadImage('border');
        Utils.loadImage('start_screen');
        Utils.loadImage('pentagram');
        Utils.loadImage('red_screen');
    }

    create() {
        const me = this;

        Animation.init();

        me._game = new Game();
    }

    update(time) {
        super.update(time);

        const me = this;

        me._game.update(time);
    }
}