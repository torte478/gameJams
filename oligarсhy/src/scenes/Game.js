import Phaser from '../lib/phaser.js';

import Animation from '../game/Animation.js';
import Consts from '../game/Consts.js';
import Core from '../game/Core.js';
import Startup from '../game/Startup.js';
import Utils from '../game/Utils.js';

export default class Game extends Phaser.Scene {

    /** @type {Core} */
    _core;

    constructor() {
        super('game');
    }

    preload() {
        const me = this;

        Utils.loadImage(me, 'hud');
        Utils.loadImage(me, 'cursor');
        Utils.loadImage(me, 'fade');
        Utils.loadImage(me, 'hud_select');

        Utils.loadSpriteSheet(me, 'dice', 75);
        Utils.loadSpriteSheet(me, 'field', Consts.Sizes.Field.Width, Consts.Sizes.Field.Height);
        Utils.loadSpriteSheet(me, 'field_corner', 240);
        Utils.loadSpriteSheet(me, 'icons', 100);
        Utils.loadSpriteSheet(me, 'field_header', 160, 50);
        Utils.loadSpriteSheet(me, 'icons_big', 150, 200);
        Utils.loadSpriteSheet(me, 'icons_corner', 240);
        Utils.loadSpriteSheet(me, 'pieces', 75);
        Utils.loadSpriteSheet(me, 'money', Consts.Sizes.Bill.Width, Consts.Sizes.Bill.Height);
        Utils.loadSpriteSheet(me, 'buttons', 360, 200);
        Utils.loadSpriteSheet(me, 'houses', 50);
        Utils.loadSpriteSheet(me, 'hand', 300, 360);
        Utils.loadSpriteSheet(me, 'cards', 160, 200);
        Utils.loadSpriteSheet(me, 'table', 500);
    }

    create() {
        const me = this;

        Animation.init(me);

        me._core = Startup.init(me);

        me.input.on('pointerdown', me._onPointerDown, me);
        me.input.on('pointermove', me._onPointerMove, me);
        me.input.keyboard.on('keydown', (e) => me._onKeyDown(e), me);
        me.input.on('wheel', (p, objs, deltaX, deltaY) => me._onMouseWheel(deltaY), me);
    }

    update(time, delta) {
        const me = this;

        me._core.update(delta);
    }

    _onKeyDown(event) {
        const me = this;

        me._core.onKeyDown(event);
    }

    _onPointerDown(pointer) {
        const me = this;

        me._core.onPointerDown(pointer);
    }

    _onMouseWheel(deltaY) {
        const me = this;

        me._core.onMouseWheel(deltaY);
    }

    _onPointerMove(pointer) {
        const me = this;

        me._core.onPointerMove(pointer);
    }
}