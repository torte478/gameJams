import Phaser from '../lib/phaser.js';

import Config from '../game/Config.js';
import Consts from '../game/Consts.js';
import Enums from '../game/Enums.js';
import Fields from '../game/Fields.js';
import Hand from '../game/Hand.js';
import Status from './Status.js';

export default class Core {

    /** @type {Fields} */
    _fields;

    /** @type {Phaser.GameObjects.Image[]} */
    _pieces;

    /** @type {Phaser.GameObjects.Sprite} */
    _dice1;

    /** @type {Phaser.GameObjects.Sprite} */
    _dice2;

    /** @type {Hand} */
    _hand;

    /** @type {Status} */
    _status;

    /**
     * @param {Phaser.GameObjects.GameObjectFactory} factory 
     */
    constructor(factory) {
        const me = this;

        me._status = new Status(Config.PieceStartPositions, Config.FirstPlayer);

        me._fields = new Fields(factory, Config.PieceStartPositions);

        me._pieces = [];
        for (let player = 0; player < Config.PieceStartPositions.length; ++player) {
            const position = me._fields.movePiece(player, 0, Config.PieceStartPositions[player]);

            const piece = factory.image(position.x, position.y, 'pieces', player)
                .setDepth(Consts.Depth.Pieces);

            me._pieces.push(piece);
        }

        me._dice1 = factory.sprite(0, 0, 'dice', 0)
            .setDepth(Consts.Depth.Pieces);

        me._dice2 = factory.sprite(
            Consts.SecondDiceOffset.X, 
            Consts.SecondDiceOffset.Y,
            'dice', 
            1)
            .setDepth(Consts.Depth.Pieces);

        me._hand = new Hand();
    }

    /**
     * @param {Phaser.Geom.Point} point 
     * @param {Boolean} isCancel 
     */
    processHumanTurn(point, isCancel) {
        const me = this;

        if (me._status.player == Enums.PlayerIndex.HUMAN)
            me.processTurn(point, isCancel);
    }
    
    /**
     * @param {Phaser.Geom.Point} point 
     * @param {Boolean} isCancel 
     */
    processTurn(point, isCancel) {
        const me = this;

        if (isCancel) {
            me._status.cancelCurrentAction();
            me._hand.cancel();
            return;
        }

        switch (me._status.state) {
            case Enums.GameState.BEGIN: {

                const diceTaked = 
                    me._hand.tryTake(me._dice1, point, Enums.HandState.DICES)
                    || me._hand.tryTake(me._dice2, point, Enums.HandState.DICES)

                if (diceTaked)
                    me._status.takeFirstDice();

                break;
            }

            case Enums.GameState.FIRST_DICE_TAKED: {

                const diceTaked = 
                    me._hand.tryTake(me._dice1, point, Enums.HandState.DICES)
                    || me._hand.tryTake(me._dice2, point, Enums.HandState.DICES)

                if (diceTaked)
                    me._status.takeSecondDice();

                break;
            }

            case Enums.GameState.SECOND_DICE_TAKED: {

                var success = me._hand.tryDrop(point);

                if (!success)
                    return;

                const result = {
                    first: Phaser.Math.Between(1, 6),
                    second: Phaser.Math.Between(1, 6)
                };

                console.log(`${result.first} ${result.second} (${result.first + result.second})`);

                me._status.dropDices(result.first, result.second);

                break;
            }

            case Enums.GameState.DICES_DROPED: {
                
                const pieceTaked = me._hand.tryTake(
                    me._pieces[me._status.player], 
                    point, 
                    Enums.HandState.PIECE);

                if (pieceTaked)
                    me._status.takePiece();

                break;
            }

            case Enums.GameState.PIECE_TAKED: {
                
                const field = me._fields.moveToFieldAtPoint(
                    me._status.player,
                    me._status.pieceIndicies[me._status.player],
                    point);

                if (!field)
                    return;

                if (field.index != me._status.nextPieceIndex)
                    return;

                me._hand.tryDrop(field.position);
                me._status.dropPiece();

                break;
            }
        }
    }

    processCpuTurn() {
        const me = this;

        let x, y;
        switch (me._status.state) {
            case Enums.GameState.BEGIN:
                x = me._dice1.x;
                y = me._dice1.y;
                break;

            case Enums.GameState.FIRST_DICE_TAKED:
                x = me._dice2.x;
                y = me._dice2.y;
                break;

            case Enums.GameState.SECOND_DICE_TAKED:
                x = Phaser.Math.Between(-100, 100);
                y = Phaser.Math.Between(-100, 100);
                break;

            case Enums.GameState.DICES_DROPED:
                const piece = me._pieces[me._status.player];
                x = piece.x;
                y = piece.y;
                break;

            case Enums.GameState.PIECE_TAKED:
                const position = me._fields.getFieldPosition(me._status.nextPieceIndex);
                x = position.x;
                y = position.y;
                break;

            default:
                throw 'Cpu Error! Unknown state';
        }

        me.processTurn(new Phaser.Geom.Point(x, y), false);
    }

    isHumanTurn() {
        const me = this;

        return me._status.player == Enums.PlayerIndex.HUMAN;
    }

    debugDropDices(value) {
        const me = this;

        if (me._status.state == Enums.GameState.BEGIN) {
            console.log(`debug drop: ${value}`);
            me._status.dropDices(value, 0);
        }
    }
}