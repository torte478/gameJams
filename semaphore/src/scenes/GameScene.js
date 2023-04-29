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

        Utils.loadImage('body');
        Utils.loadImage('ship_front');
        Utils.loadImage('ship_back');
        Utils.loadImage('wave');
        Utils.loadImage('signal_box');

        Utils.loadSpriteSheet('hand', Consts.Unit.Normal * 4, Consts.Unit.Normal * 3);
        Utils.loadSpriteSheet('letters_numbers', Consts.Unit.Big);
    }

    create() {
        const me = this;

        Animation.init();

        me._game = new Game();
    }

    update(time, delta) {
        super.update(time, delta);

        const me = this;

        me._game.update(time, delta);
    }
}