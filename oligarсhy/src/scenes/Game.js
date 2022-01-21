import Phaser from '../lib/phaser.js';

import Consts from '../game/Consts.js';
import Global from '../game/Global.js';

export default class Game extends Phaser.Scene {

    /** @type {Phaser.GameObjects.Text} */
    log;

    /** @type {Phaser.GameObjects.Image} */
    cursor;

    dices = {
        /** @type {Phaser.GameObjects.Sprite} */
        first: null,

        /** @type {Phaser.GameObjects.Sprite} */
        second: null
    };

    constructor() {
        super('game');
    }

    preload() {
        const me = this;

        me.loadImage('temp');
        me.loadImage('hud');
        me.loadImage('cursor');
        me.loadSpriteSheet('dice', 50);
    }

    create() {
        const me = this;

        me.add.image(0, 0, 'temp');

        me.add.image(0, 0, 'hud')
            .setOrigin(0)
            .setScrollFactor(0)
            .setDepth(Consts.Depth.HUD);

        me.cursor = me.createCursor();

        me.dices.first = me.add.sprite(0, 0, 'dice', 0);
        me.dices.second = me.add.sprite(75, 10, 'dice', 1);

        me.cameras.main.setScroll(Consts.World.Width / -2, Consts.World.Height / -2);

        if (Global.isDebug) {
            me.log = me.add.text(10, 10, '', { fontSize: 14, backgroundColor: '#000' })
                .setScrollFactor(0)
                .setDepth(Consts.Depth.Max);
        }
    }

    update() {
        const me = this;

        if (Global.isDebug) {
            me.log.text = 
            `ptr: ${me.cursor.x | 0} ${me.cursor.worldY | 0}\n` + 
            `cam: ${me.cameras.main.scrollX | 0} ${me.cameras.main.scrollX | 0}`
        }
    }

    loadImage(name) {
        const me = this;

        return this.load.image(name, `assets/${name}.png`);
    }

    createCursor() {
        const me = this;

        const cursor = me.add.image(0, 0, 'cursor')
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
}