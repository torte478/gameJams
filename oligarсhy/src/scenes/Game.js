import Phaser from '../lib/phaser.js';

import Config from '../game/Config.js';
import Consts from '../game/Consts.js';
import Core from '../game/Core.js';
import Utils from '../game/Utils.js';

// TODO : all logic to Core
export default class Game extends Phaser.Scene {

    /** @type {Phaser.GameObjects.Text} */
    _log;

    /** @type {Core} */
    _core;

    constructor() {
        super('game');
    }

    preload() {
        const me = this;

        Utils.loadImage(me, 'temp');
        Utils.loadImage(me, 'hud');
        Utils.loadImage(me, 'cursor');

        Utils.loadSpriteSheet(me, 'dice', 50);
        Utils.loadSpriteSheet(me, 'field', Consts.Sizes.Field.Width, Consts.Sizes.Field.Height);
        Utils.loadSpriteSheet(me, 'field_corner', 240);
        Utils.loadSpriteSheet(me, 'icons', 100);
        Utils.loadSpriteSheet(me, 'field_header', 160, 50);
        Utils.loadSpriteSheet(me, 'icons_big', 150, 200);
        Utils.loadSpriteSheet(me, 'icons_corner', 240);
        Utils.loadSpriteSheet(me, 'pieces', 50);
        Utils.loadSpriteSheet(me, 'money', Consts.Sizes.Bill.Width, Consts.Sizes.Bill.Height);
        Utils.loadSpriteSheet(me, 'buttons', 360, 200);
        Utils.loadSpriteSheet(me, 'houses', 50);
        Utils.loadSpriteSheet(me, 'hand', 300, 360);
    }

    create() {
        const me = this;

        // Phaser

        me.physics.world.setBounds(-1500, -1500, 3000, 3000);

        me.cameras.main
            .setScroll(
                Config.Start.CameraPosition.x - Consts.Viewport.Width / 2,
                Config.Start.CameraPosition.y - Consts.Viewport.Height / 2)
            .setBounds(
                me.physics.world.bounds.x,
                me.physics.world.bounds.y,
                me.physics.world.bounds.width,
                me.physics.world.bounds.height);

        // custom

        me._core = new Core(me);

        // events

        me.input.on('pointerdown', me._onPointerDown, me);
        me.input.keyboard.on('keydown', (e) => me._onKeyDown(e), me);
        me.input.on('wheel', (p, objs, deltaX, deltaY) => me._onMouseWheel(deltaY), me);

        // debug

        if (Config.Debug.Global) {
            me._log = me.add.text(10, 10, '', { fontSize: 14, backgroundColor: '#000' })
                .setScrollFactor(0)
                .setDepth(Consts.Depth.Max);
        }
    }

    update(time, delta) {
        const me = this;

        me._core.update(delta);

        if (Config.Debug.Global) {
            me._log.text = 
            `ptr: ${me._core._cursor.x | 0} ${me._core._cursor.y | 0}\n` + 
            `mse: ${me.input.activePointer.worldX} ${me.input.activePointer.worldY}`;
        }
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

        me._core.updateHud(deltaY);
    }
}