import Phaser from '../lib/phaser.js';

import Config from '../game/Config.js';
import Consts from '../game/Consts.js';
import Enums from '../game/Enums.js';
import Fields from '../game/Fields.js';
import Hand from '../game/Hand.js';
import State from '../game/State.js';

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

    /** @type {State} */
    _state;

    /**
     * 
      * @param {Phaser.GameObjects.GameObjectFactory} factory 
     */
    constructor(factory) {
        const me = this;

        me._state = new State(Config.PlayersStart, 0); //TODO: 0 -> from config

        me._fields = new Fields(factory, Config.PlayersStart);

        me._pieces = [];
        for (let i = 0; i < Config.PlayersStart.length; ++i) {
            const position = me._fields.movePiece(i, Config.PlayersStart[i]);

            const piece = factory.image(position.x, position.y, 'pieces', i)
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
            .setDepth(Consts.Depth.Pieces);;

        me._hand = new Hand();
    }

    processTurn(point, isCancel) {
        const me = this;

        if (isCancel) {
            me._state.cancelCurrentAction();
            me._hand.cancel();
            return;
        }

        switch (me._state.current) {
            case Enums.GameState.BEGIN: {

                const diceTaked = 
                    me._hand.tryTake(me._dice1, point, Enums.HandContent.DICES)
                    || me._hand.tryTake(me._dice2, point, Enums.HandContent.DICES)

                if (diceTaked)
                    me._state.takeFirstDice();

                break;
            }

            case Enums.GameState.FIRST_DICE_TAKED: {

                const diceTaked = 
                    me._hand.tryTake(me._dice1, point, Enums.HandContent.DICES)
                    || me._hand.tryTake(me._dice2, point, Enums.HandContent.DICES)

                if (diceTaked)
                    me._state.takeSecondDice();

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

                me._state.dropDices(result.first, result.second);

                break;
            }

            case Enums.GameState.DICES_DROPED: {
                
                const pieceTaked = me._hand.tryTake(
                    me._pieces[me._state.player], 
                    point, 
                    Enums.HandContent.PIECE);

                if (pieceTaked)
                    me._state.takePiece();

                break;
            }

            case Enums.GameState.PIECE_TAKED: {
                
                const field = me._fields.findFieldByPoint(me._state.player, point);

                if (!field)
                    return;

                if (field.index != me._state.nextPieceIndex)
                    return;

                me._hand.tryDrop(field.position);
                me._state.dropPiece();

                break;
            }
        }
    }

    processCpuTurn() {
        const me = this;

        let x, y;
        switch (me._state.current) {
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
                const piece = me._pieces[me._state.player];
                x = piece.x;
                y = piece.y;
                break;

            case Enums.GameState.PIECE_TAKED:
                const position = me._fields.movePiece(me._state.player, me._state.nextPieceIndex);
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

        return me._state.player == Enums.Players.HUMAN;
    }

    debugDropDices(first, second) {
        const me = this;

        me._state.dropDices(first, second);
    }
}