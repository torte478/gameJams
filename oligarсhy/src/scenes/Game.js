import Phaser from '../lib/phaser.js';

import Consts from '../game/Consts.js';
import Fields from '../game/Fields.js';
import Global from '../game/Global.js';
import Hand from '../game/Hand.js';
import State from '../game/State.js';
import Enums from '../game/Enums.js';

export default class Game extends Phaser.Scene {

    /** @type {Phaser.GameObjects.Text} */
    log;

    /** @type {Phaser.GameObjects.Image} */
    cursor;

    /** @type {Fields} */
    fields;

    /** @type {State} */
    state;

    /** @type {Phaser.GameObjects.Image[]} */
    pieces;

    /** @type {Phaser.GameObjects.Sprite} */
    dice1;

    /** @type {Phaser.GameObjects.Sprite} */
    dice2;

    /** @type {Hand} */
    hand;

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
        me.loadSpriteSheet('icons_big', 150, 200);
        me.loadSpriteSheet('icons_corner', 240);
        me.loadSpriteSheet('pieces', 50);
    }

    create() {
        const me = this;

        me.add.image(0, 0, 'temp');

        me.fields = new Fields(me, Global.PlayersStart);

        me.add.image(0, 0, 'hud')
            .setOrigin(0)
            .setScrollFactor(0)
            .setDepth(Consts.Depth.HUD)
            .setVisible(false); // TODO

        me.cursor = me.createCursor();

        me.cameras.main.setScroll(
            Global.StartPosition.x - Consts.Viewport.Width / 2,
            Global.StartPosition.y - Consts.Viewport.Height / 2);

        me.input.on('pointerdown', me.onPointerDown, me);
        me.input.keyboard.on('keydown', (e) => me.onKeyDown(e), me);

        me.state = new State(Global.PlayersStart, 0); //0 -> from config

        me.pieces = [];
        for (let i = 0; i < Global.PlayersStart.length; ++i) {
            const position = me.fields.movePiece(i, Global.PlayersStart[i]);

            const piece = me.add.image(position.x, position.y, 'pieces', i)
                .setDepth(Consts.Depth.Pieces);

            me.pieces.push(piece);
        }

        me.dice1 = me.add.sprite(0, 0, 'dice', 0)
            .setDepth(Consts.Depth.Pieces);

        me.dice2 = me.add.sprite(
            Consts.SecondDiceOffset.X, 
            Consts.SecondDiceOffset.Y,
            'dice', 
            1)
            .setDepth(Consts.Depth.Pieces);;

        me.hand = new Hand();

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

        return me.load.image(name, `assets/${name}.png`);
    }

    createCursor() {
        const me = this;

        const cursor = me.add.image(Global.StartPosition.x, Global.StartPosition.y, 'cursor')
            .setDepth(Consts.Depth.Max)
            .setVisible(false);

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

    loadSpriteSheet(name, width, height) {
        const me = this;

        return me.load.spritesheet(name, `assets/${name}.png`, {
            frameWidth: width,
            frameHeight: !!height ? height : width
        });
    }

    onKeyDown(event) {
        const me = this;

        if (Global.Debug) {
            if (isNaN(event.key) || me.state.current != Enums.GameState.BEGIN) 
                return;

            const result = {
                first: 0,
                second: +event.key
            };

            console.log(`${result.first} ${result.second} (${result.first + result.second})`);

            me.state.dropDices(result.first, result.second);
        }
    }

    /**
     * @param {Phaser.Input.Pointer} pointer 
     */
    onPointerDown(pointer) {
        const me = this;

        const point = new Phaser.Geom.Point(me.cursor.x, me.cursor.y);

        if (pointer.rightButtonDown()) {
            me.state.cancelCurrentAction();
            me.hand.cancel();
            return;
        }

        // TODO : to independent class
        switch (me.state.current) {
            case Enums.GameState.BEGIN: {

                const diceTaked = 
                    me.hand.tryTake(me.dice1, point, Enums.HandContent.DICES)
                    || me.hand.tryTake(me.dice2, point, Enums.HandContent.DICES)

                if (diceTaked)
                    me.state.takeFirstDice();

                break;
            }

            case Enums.GameState.FIRST_DICE_TAKED: {

                const diceTaked = 
                    me.hand.tryTake(me.dice1, point, Enums.HandContent.DICES)
                    || me.hand.tryTake(me.dice2, point, Enums.HandContent.DICES)

                if (diceTaked)
                    me.state.takeSecondDice();

                break;
            }

            case Enums.GameState.SECOND_DICE_TAKED: {

                const result = {
                    first: Phaser.Math.Between(1, 6),
                    second: Phaser.Math.Between(1, 6)
                };

                console.log(`${result.first} ${result.second} (${result.first + result.second})`);

                me.state.dropDices(result.first, result.second);

                me.hand.drop(point);

                break;
            }

            case Enums.GameState.DICES_DROPED: {
                
                const pieceTaked = me.hand.tryTake(
                    me.pieces[me.state.player], 
                    point, 
                    Enums.HandContent.PIECE);

                if (pieceTaked)
                    me.state.takePiece();

                break;
            }

            case Enums.GameState.PIECE_TAKED: {
                
                const field = me.fields.findField(me.state.player, point);

                if (!field)
                    return;

                if (field.index != me.state.nextPieceIndex)
                    return;

                me.hand.drop(field.position);
                me.state.dropPiece();

                break;
            }
        }
    }
}