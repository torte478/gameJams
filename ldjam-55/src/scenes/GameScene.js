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

        Utils.loadImage('road');
        Utils.loadImage('bus');
        Utils.loadImage('busStop');
        Utils.loadImage('passengerOutside');
        Utils.loadSpriteSheet('smoke', 50);
        Utils.loadImage('sign');
        Utils.loadSpriteSheet('lattern', 40, 160);
        Utils.loadSpriteSheet('insect', 100);
        Utils.loadSpriteSheet('shield', 100);
        Utils.loadSpriteSheet('gun', 50, 100);
        Utils.loadSpriteSheet('blood', 100);

        Utils.loadImage('busInterior');
        Utils.loadSpriteSheet('passengerInside', 50);
        Utils.loadImage('dismorale');

        Utils.loadImage('moneyBox');
        Utils.loadSpriteSheet('buttons', 60);
        Utils.loadImage('okButton');

        Utils.loadSpriteSheet('panel', 300, 100);
        Utils.loadSpriteSheet('stratagems', 80);
        Utils.loadSpriteSheet('arrows', 40);
        Utils.loadSpriteSheet('moneyEffect', 100, 50);

        Utils.loadMp3('theme');
        Utils.loadWav('engine');
        Utils.loadWav('income');
        Utils.loadWav('dismorale');
        Utils.loadWav('shot');
        Utils.loadWav('select');
        Utils.loadWav('summon');
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