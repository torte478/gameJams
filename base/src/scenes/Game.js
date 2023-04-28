import Animation from '../game/utils/Animation.js';
import Utils from '../game/utils/Utils.js';

import Core from '../game/Core.js';
import HereScene from '../game/utils/HereScene.js';

export default class Game extends HereScene {

	/** @type {Core} */
	_core;

    constructor() {
        super('game');
    }

    preload() {
        Utils.runLoadingBar();

        Utils.loadWav('button_click');
    }

    create() {
        const me = this;

        Animation.init();

        me._core = new Core();
    }

    update() {
        const me = this;

        me._core.update();
    }
}