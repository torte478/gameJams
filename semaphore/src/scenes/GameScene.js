import Animation from '../framework/Animation.js';
import HereScene from '../framework/HereScene.js';
import Utils from '../framework/Utils.js';

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

        Utils.loadImage('hand');
    }

    create() {
        const me = this;

        Animation.init();

        me._game = new Game();
    }

    update() {
        super.update();

        const me = this;

        me._game.update();
    }
}