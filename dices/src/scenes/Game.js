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

        this._levelIndex = Config.LevelIndex;
    }

    init(data) {
        const me = this;

        me._levelIndex = data.level != undefined
            ? data.level
            : Config.LevelIndex;
    }

    preload() {
        const me = this;

        Utils.loadSpriteSheet(me, 'board', Consts.UnitSmall);
        Utils.loadSpriteSheet(me, 'dice', Consts.UnitBig);
        Utils.loadSpriteSheet(me, 'piece', Consts.Unit);
        Utils.loadSpriteSheet(me, 'dice_small', Consts.UnitSmall);
        Utils.loadImage(me, 'storage');
        Utils.loadSpriteSheet(me, 'card', Consts.CardSize.Width, Consts.CardSize.Height);
        Utils.loadImage(me, 'background');
        Utils.loadImage(me, 'arrow');
        Utils.loadSpriteSheet(me, 'highlight', Consts.Unit);
        Utils.loadImage(me, 'carousel');
        Utils.loadImage(me, 'carousel_back');
        Utils.loadSpriteSheet(me, 'buttons', 100);

        me.input.on('pointerdown', me._onPointerDown, me);
        me.input.keyboard.on('keydown', (e) => me._onKeyDown(e), me);
    }

    create() {
        const me = this;

        Animation.init(me);

        me._core = new Core(me, me._levelIndex);
    }

    update() {
        const me = this;

        me._core.update();
    }

    _onPointerDown(pointer) {
        const me = this;

        me._core.onPointerDown(pointer);
    }

    _onKeyDown(event) {
        const me = this;

        me._core.onKeyDown(event);
    }
}