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
        Utils.loadImage('fade');
        Utils.loadImage('fade_white');
        Utils.loadImage('clipboard');
        Utils.loadImage('hints');
        Utils.loadImage('seagull_big');
        Utils.loadImage('minus_one');
        Utils.loadImage('main_menu');
        Utils.loadImage('tutorial');
        Utils.loadImage('seagull_attack');

        Utils.loadSpriteSheet('signal_box', Consts.Unit.Normal * 3);
        Utils.loadSpriteSheet('hand', Consts.Unit.Normal * 4, Consts.Unit.Normal * 3);
        Utils.loadSpriteSheet('letters_numbers', Consts.Unit.Big);
        Utils.loadSpriteSheet('rain', 10)
        Utils.loadSpriteSheet('seagull_small', Consts.Unit.Big);
        Utils.loadSpriteSheet('trash', 300);

        Utils.loadMp3('seagull_big_in');
        Utils.loadMp3('seagull_big_out');
        Utils.loadMp3('seagull_small_in');
        Utils.loadMp3('seagull_small_out');
        Utils.loadMp3('seagull_damage');
        Utils.loadMp3('seagull_click');
        Utils.loadMp3('seagull_pop');
        Utils.loadMp3('seagull_jumpscare');

        Utils.loadWav('button_click');
        Utils.loadWav('cancel');
        Utils.loadWav('clipboard');
        Utils.loadWav('fail');
        Utils.loadWav('lightning');
        Utils.loadWav('send');
        Utils.loadWav('success');
        Utils.loadWav('switch');

        Utils.loadMp3('idle');
        Utils.loadMp3('ending');
        Utils.loadMp3('rain');
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