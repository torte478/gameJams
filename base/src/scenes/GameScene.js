import Animation from '../framework/Animation.js';
import HereScene from '../framework/HereScene.js';
import Utils from '../framework/Utils.js';

import Game from '../game/Game.js';

export default class GameScene extends HereScene {

	/** @type {Game} */
	_game;

    constructor() {
        super('gameScene');
    }

    preload() {
        Utils.runLoadingBar();

        Utils.loadWav('button_click');
    }

    create() {
        const me = this;

        Animation.init();

        me._game = new Game();
    }

    update() {
        const me = this;

        me._game.update();
    }
}