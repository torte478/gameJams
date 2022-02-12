import Phaser from '../lib/phaser.js';

import Config from '../game/Config.js';
import Consts from '../game/Consts.js';
import Enums from '../game/Enums.js';
import Fields from '../game/Fields.js';
import Player from './Player.js';
import Hand from '../game/Hand.js';
import Status from './Status.js';
import Utils from './Utils.js';

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

    /** @type {Player[]} */
    _players;

    /**
     * @param {Phaser.GameObjects.GameObjectFactory} factory 
     */
    constructor(factory) {
        const me = this;

        me._status = new Status(Config.Start.PiecePositions, Config.Start.Player, Config.Start.State);

        me._fields = new Fields(factory, Config.Start.PiecePositions);

        me._pieces = [];
        for (let player = 0; player < Config.PlayerCount; ++player) {
            const position = me._fields.movePiece(player, 0, Config.Start.PiecePositions[player]);

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

        me._players = [];
        for (let i = 0; i < Config.PlayerCount; ++ i) {
            const player = new Player(factory, i, Config.Start.Money);
            player.startTurn(i == Config.Start.Player)
            me._players.push(player);
        }
    }
    
    /**
     * @param {Phaser.Geom.Point} point 
     * @param {Boolean} isCancel 
     */
    processTurn(point, isCancel) {
        const me = this;

        if (isCancel) {
            me._cancelTurn();
            return;
        }

        switch (me._status.state) {
            case Enums.GameState.BEGIN: {

                const diceTaked = 
                    me._hand.tryTake(me._dice1, point, Enums.HandState.DICES)
                    || me._hand.tryTake(me._dice2, point, Enums.HandState.DICES)

                if (diceTaked)
                    me._status.setState(Enums.GameState.FIRST_DICE_TAKED);

                break;
            }

            case Enums.GameState.FIRST_DICE_TAKED: {

                const diceTaked = 
                    me._hand.tryTake(me._dice1, point, Enums.HandState.DICES)
                    || me._hand.tryTake(me._dice2, point, Enums.HandState.DICES)

                if (diceTaked)
                    me._status.setState(Enums.GameState.SECOND_DICE_TAKED);

                break;
            }

            case Enums.GameState.SECOND_DICE_TAKED: {

                var success = me._hand.tryDrop(point);

                if (!success)
                    return;

                const first = Phaser.Math.Between(1, 6);
                const second = Phaser.Math.Between(1, 6);

                console.log(`${first} ${second} (${first + second})`);

                me._applyDiceDrop(first, second);

                break;
            }

            case Enums.GameState.DICES_DROPED: {
                
                const pieceTaked = me._hand.tryTake(
                    me._pieces[me._status.player], 
                    point, 
                    Enums.HandState.PIECE);

                if (pieceTaked)
                    me._status.setState(Enums.GameState.PIECE_TAKED);

                break;
            }

            case Enums.GameState.PIECE_TAKED: {
                
                const field = me._fields.tryMoveToFieldAtPoint(
                    me._status.player,
                    me._status.pieceIndicies[me._status.player],
                    point);

                if (!field)
                    return;

                if (field.index != me._status.targetPieceIndex)
                    return;

                me._hand.tryDrop(field.position);

                me._status.pieceIndicies[me._status.player] = me._status.targetPieceIndex;

                const canBuyProperty = Config.Fields[field.index].type == Enums.FieldType.PROPERTY
                    && Config.Fields[field.index].cost <= me._players[me._status.player].getTotalMoney();

                if (canBuyProperty) 
                    me._status.setState(Enums.GameState.PIECE_ON_PROPERTY);
                else
                    me._finishTurn();

                break;
            }

            case Enums.GameState.PIECE_ON_PROPERTY: {
                const player = me._players[me._status.player];
                const billIndex = player.findBillOnPoint(point);

                if (billIndex >= 0) {
                    me._hand.takeBill(billIndex);
                }
                else {
                    const button = player.isButtonClick(point);
                    if (!button)
                        return;

                    const field = Config.Fields[me._status.targetPieceIndex];
                    const handMoney = me._hand.getTotalMoney();
                    if (handMoney < field.cost)
                        return;

                    const money = me._hand.dropMoney();
                    const diff = Utils.getBillCount(money, handMoney - field.cost);
                    player.addMoney(diff);
                    player.addProperty(me._status.targetPieceIndex);

                    me._finishTurn();
                }

                break;
            }
        }
    }

    processCpuTurn() {
        const me = this;

        let x, y;
        switch (me._status.state) {
            case Enums.GameState.BEGIN: {
                //TODO : refactory by Utils.toPoint();
                x = me._dice1.x;
                y = me._dice1.y;
                break;
            }

            case Enums.GameState.FIRST_DICE_TAKED: {
                x = me._dice2.x;
                y = me._dice2.y;
                break;
            }

            case Enums.GameState.SECOND_DICE_TAKED: {
                x = Phaser.Math.Between(-100, 100);
                y = Phaser.Math.Between(-100, 100);
                break;
            }

            case Enums.GameState.DICES_DROPED: {
                const piece = me._pieces[me._status.player];
                x = piece.x;
                y = piece.y;
                break;
            }

            case Enums.GameState.PIECE_TAKED: {
                const position = me._fields.getFieldPosition(me._status.targetPieceIndex);
                x = position.x;
                y = position.y;
                break;
            }

            case Enums.GameState.PIECE_ON_PROPERTY: {
                const cost = Config.Fields[me._status.targetPieceIndex].cost;
                const handMoney = me._hand.getTotalMoney();
                const diff = cost - handMoney;
                if (diff > 0) {
                    const position = me._getCurrentPlayer().getNextOptimalBillPosition(cost - handMoney);
                    x = position.x;
                    y = position.y;
                } else {
                    const position = me._getCurrentPlayer().getBuyButtonPosition();
                    x = position.x;
                    y = position.y;
                }
                break;
            }

            default:
                const stateStr = Utils.enumToString(Enums.GameState, me._status.state);
                throw `CPU Error! Unknown state ${stateStr}`;
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
            console.log(`debug drop: ${value}`); // TODO : to debug log
            me._applyDiceDrop(value, 0);
        }
    }

    _applyDiceDrop(first, second) {
        const me = this;

        const current = me._status.pieceIndicies[me._status.player];
        me._status.targetPieceIndex = (current + first + second) % Consts.FieldCount;
        me._status.setState(Enums.GameState.DICES_DROPED);
    }

    _cancelTurn() {
        const me = this;

        const money = me._hand.dropMoney();
        me._hand.cancel();

        me._players[me._status.player].addMoney(money);

        const next = me._getNextStateAfterCancel();
        me._status.setState(next);
    }

    _getNextStateAfterCancel() {
        const me = this;

        switch (me._status.state) {
            case Enums.GameState.FIRST_DICE_TAKED:
            case Enums.GameState.SECOND_DICE_TAKED:
                return Enums.GameState.BEGIN;

            case Enums.GameState.PIECE_TAKED:
                return Enums.GameState.DICES_DROPED;
            
            default:
                return me._status.state;
        }
    }

    _finishTurn() {
        const me = this;

        me._status.player = (me._status.player + 1) % Config.PlayerCount;
        
        for (let i = 0; i < me._players.length; ++i)
            me._players[i].startTurn(i == me._status.player);

        me._status.setState(Enums.GameState.BEGIN);
    }

    //TODO: refactor all occurences
    _getCurrentPlayer() {
        const me = this;

        return me._players[me._status.player];
    }
}