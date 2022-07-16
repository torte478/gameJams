import Phaser from '../lib/phaser.js';

import Core from '../game/Core.js';
import Animation from '../game/Animation.js';
import Utils from '../game/Utils.js';
import Consts from '../game/Consts.js';
import Config from '../game/Config.js';

export default class Game extends Phaser.Scene {

	/** @type {Core} */
	_core;

    constructor() {
        super('game');
    }

    preload() {
        const me = this;

        Utils.loadSpriteSheet(me, 'board', Consts.UnitSmall);
        Utils.loadSpriteSheet(me, 'dice', Consts.UnitBig);
    }

    create() {
        const me = this;

        Animation.init(me);

        me._core = new Core(me, Config.BoardSize);
    }

    update() {
        const me = this;

        me._core.update();
    }
}