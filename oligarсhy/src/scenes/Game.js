import Phaser from '../lib/phaser.js';

import Config from '../game/Config.js';
import Consts from '../game/Consts.js';
import Core from '../game/Core.js';

export default class Game extends Phaser.Scene {

    /** @type {Phaser.GameObjects.Text} */
    log;

    /** @type {Phaser.GameObjects.Image} */
    cursor;

    /** @type {Core} */
    core;

    constructor() {
        super('game');
    }

    preload() {
        const me = this;

        me.loadImage('temp');
        me.loadImage('hud');
        me.loadImage('cursor');
        me.loadSpriteSheet('dice', 50);
        me.loadSpriteSheet('field', Consts.Field.Width, Consts.Field.Height);
        me.loadSpriteSheet('field_corner', 240);
        me.loadSpriteSheet('icons', 100);
        me.loadSpriteSheet('field_header', 160, 50);
        me.loadSpriteSheet('icons_big', 150, 200);
        me.loadSpriteSheet('icons_corner', 240);
        me.loadSpriteSheet('pieces', 50);
        me.loadSpriteSheet('money', Consts.MoneySize.Width, Consts.MoneySize.Height);
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

        me.core = new Core(me.add);

        me.add.image(0, 0, 'hud')
            .setOrigin(0)
            .setScrollFactor(0)
            .setDepth(Consts.Depth.HUD)
            .setVisible(false); // TODO

        me.cursor = me.createCursor();

        // events

        me.input.on('pointerdown', me.onPointerDown, me);
        me.input.keyboard.on('keydown', (e) => me.onKeyDown(e), me);

        // debug

        if (Config.Debug) {
            me.log = me.add.text(10, 10, '', { fontSize: 14, backgroundColor: '#000' })
                .setScrollFactor(0)
                .setDepth(Consts.Depth.Max);
        }
    }

    update() {
        const me = this;

        if (!me.core.isHumanTurn()) {
            me.core.processCpuTurn();
        }

        if (Config.Debug) {
            me.log.text = 
            `ptr: ${me.cursor.x | 0} ${me.cursor.y | 0}\n` + 
            `mse: ${me.input.activePointer.worldX} ${me.input.activePointer.worldY}`;
        }
    }

    onKeyDown(event) {
        const me = this;

        if (Config.Debug) {
            
            if (isNaN(event.key))
                return;

            me.core.debugDropDices(+event.key);
        }
    }

    /**
     * @param {Phaser.Input.Pointer} pointer 
     */
    onPointerDown(pointer) {
        const me = this;

        if (me.core.isHumanTurn()) { //TODO : to Core (it's logic)
            const point = new Phaser.Geom.Point(me.cursor.x, me.cursor.y);
            me.core.processTurn(point, pointer.rightButtonDown());
        }
    }

    createCursor() {
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
        }, me);

        return cursor;
    }

    // TODO : to Utils
    loadSpriteSheet(name, width, height) {
        const me = this;

        return me.load.spritesheet(name, `assets/${name}.png`, {
            frameWidth: width,
            frameHeight: !!height ? height : width
        });
    }

    loadImage(name) {
        const me = this;

        return me.load.image(name, `assets/${name}.png`);
    }
}