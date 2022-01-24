import Phaser from '../lib/phaser.js';

import Consts from '../game/Consts.js';
import Dices from '../game/Dices.js';
import Fields from '../game/Fields.js';
import Global from '../game/Global.js';

export default class Game extends Phaser.Scene {

    /** @type {Phaser.GameObjects.Text} */
    log;

    /** @type {Phaser.GameObjects.Image} */
    cursor;

    /** @type {Dices} */
    dices;

    /** @type {Fields} */
    fields;

    constructor() {
        super('game');
    }

    preload() {
        const me = this;

        me.loadImage('temp');
        me.loadImage('hud');
        me.loadImage('cursor');
        me.loadSpriteSheet('dice', 50);
        me.loadSpriteSheet('field', 160, 240);
        me.loadSpriteSheet('field_corner', 240);
        me.loadSpriteSheet('icons', 100);
        me.loadSpriteSheet('field_header', 160, 50);
    }

    create() {
        const me = this;

        me.add.image(0, 0, 'temp');

        me.fields = new Fields(me);

        me.add.image(0, 0, 'hud')
            .setOrigin(0)
            .setScrollFactor(0)
            .setDepth(Consts.Depth.HUD);

        me.dices = new Dices(me);

        me.cursor = me.createCursor();

        me.cameras.main.setScroll(
            Global.StartPosition.x - Consts.Viewport.Width / 2,
            Global.StartPosition.y - Consts.Viewport.Height / 2);

        me.input.on('pointerdown', (p) => me.onPointerDown(), me);

        if (Global.Debug) {
            me.log = me.add.text(10, 10, '', { fontSize: 14, backgroundColor: '#000' })
                .setScrollFactor(0)
                .setDepth(Consts.Depth.Max);
        }
    }

    update() {
        const me = this;

        if (Global.Debug) {
            me.log.text = 
            `ptr: ${me.cursor.x | 0} ${me.cursor.y | 0}\n` + 
            `cam: ${me.cameras.main.scrollX | 0} ${me.cameras.main.scrollX | 0}`
        }
    }

    loadImage(name) {
        const me = this;

        return this.load.image(name, `assets/${name}.png`);
    }

    createCursor() {
        const me = this;

        const cursor = me.add.image(Global.StartPosition.x, Global.StartPosition.y, 'cursor')
            .setDepth(Consts.Depth.Max)
            .setVisible(false);

        me.input.on('pointerdown', (p) => {
            /** @type {Phaser.Input.Pointer} */
            const pointer = p;

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

    loadSpriteSheet(name, width, height) {
        const me = this;

        return me.load.spritesheet(name, `assets/${name}.png`, {
            frameWidth: width,
            frameHeight: !!height ? height : width
        });
    }

    onPointerDown() {
        const me = this;

        const point = new Phaser.Geom.Point(me.cursor.x, me.cursor.y);

        if (me.dices.canDrop()) {
            const result = me.dices.drop(point);
            console.log(result.first, result.second);
        }
        else {
            me.dices.checkClick(point);
        }
    }
}