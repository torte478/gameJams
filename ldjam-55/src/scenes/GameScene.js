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

        Utils.loadImage('back01');
        Utils.loadImage('back02');
        Utils.loadImage('back03');
        Utils.loadImage('back04');

        Utils.loadImage('road');
        Utils.loadImage('bus');
        Utils.loadImage('busStop');
        Utils.loadImage('passenger');

        Utils.loadImage('busInterior');
    }

    create() {
        const me = this;

        Animation.init();

        me._game = new Game();
    }

    update(time, delta) {
        super.update();

        const me = this;

        me._game.update(delta / 1000.0);
    }
}