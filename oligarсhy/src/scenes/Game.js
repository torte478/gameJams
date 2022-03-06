import Phaser from '../lib/phaser.js';

import Config from '../game/Config.js';
import Consts from '../game/Consts.js';
import Core from '../game/Core.js';
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

        me._createAnimation();

        me._core = new Core(me);

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

        if (Config.Debug.Global) {
            
            if (isNaN(event.key))
                return;

            me._core.debugDropDices(+event.key);
        }
    }

    /**
     * @param {Phaser.Input.Pointer} pointer 
     */
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

    _createAnimation() {
        const me = this;

        me.anims.create({
            key: 'first_dice_roll',
            frames: me.anims.generateFrameNames('dice', { frames: [ 7, 8, 9, 10, 11, 12, 13, 14 ]}),
            frameRate: 24,
            repeat: -1
        });

        me.anims.create({
            key: 'second_dice_roll',
            frames: me.anims.generateFrameNames('dice', { frames: [ 10, 11, 12, 13, 14, 7, 8, 9 ]}),
            frameRate: 25,
            repeat: -1
        });
    }
}