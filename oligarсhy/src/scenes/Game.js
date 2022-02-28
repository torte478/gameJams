import Phaser from '../lib/phaser.js';

import Config from '../game/Config.js';
import Consts from '../game/Consts.js';
import Core from '../game/Core.js';
import Utils from '../game/Utils.js';

// TODO : all logic to Core
export default class Game extends Phaser.Scene {

    /** @type {Phaser.GameObjects.Text} */
    _log;

    /** @type {Phaser.GameObjects.Image} */
    _cursor;

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

        me._core = new Core(me.add);

        me._cursor = me._createCursor();

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

    update() {
        const me = this;

        if (!me._core._isHumanTurn()) {
            me._core.processCpuTurn();
        }

        if (Config.Debug.Global) {
            me._log.text = 
            `ptr: ${me._cursor.x | 0} ${me._cursor.y | 0}\n` + 
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

        const point = new Phaser.Geom.Point(me._cursor.x, me._cursor.y);
        me._core.processHumanTurn(point, pointer.rightButtonDown());
    }

    _onMouseWheel(deltaY) {
        const me = this;

        me._core.updateHud(deltaY);
    }

    _createCursor() {
        const me = this;

        const cursor = me.physics.add.image(
            Config.Start.CameraPosition.x, 
            Config.Start.CameraPosition.y, 
            'cursor')
            .setDepth(Consts.Depth.Max)
            .setVisible(false)
            .setCollideWorldBounds(true);

        me.input.on('pointerdown', (p) => {
            if (me.input.mouse.locked)
                return;

            me.input.mouse.requestPointerLock();
            cursor.setVisible(true);

            me.cameras.main.startFollow(cursor, true, 0.05, 0.05);
        }, me);

        me.input.on('pointermove', (p) => {
            /** @type {Phaser.Input.Pointer} */
            const pointer = p;

            if (!me.input.mouse.locked) 
                return;

            cursor.x += pointer.movementX;
            cursor.y += pointer.movementY;

            me._core.onPointerMove(Utils.toPoint(cursor));
        }, me);

        return cursor;
    }
}