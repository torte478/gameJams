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
            const player = new Player(factory, i, Config.Start.Money, Config.Start.Fields[i]);
            me._players.push(player);
        }

        me._setState(Enums.GameState.BEGIN);
    }
    
    /**
     * @param {Phaser.Geom.Point} point 
     * @param {Boolean} isCancel 
     */
    processTurn(point, isCancel) {
        const me = this;

        if (isCancel) {
            me._cancelTurn();
            return; // TODO : refactor - combine return with previous
        }

        if (Utils.contains(Consts.States.Management, me._status.state)) {
            if (me._trySelectOwnField(point))
                return me._setState(Enums.GameState.OWN_FIELD_SELECTED);
        }

        switch (me._status.state) {
            case Enums.GameState.BEGIN: {

                const diceTaked = 
                    me._hand.tryTake(me._dice1, point, Enums.HandState.DICES)
                    || me._hand.tryTake(me._dice2, point, Enums.HandState.DICES)

                if (diceTaked)
                    me._setState(Enums.GameState.FIRST_DICE_TAKED);

                break;
            }

            case Enums.GameState.FIRST_DICE_TAKED: {

                const diceTaked = 
                    me._hand.tryTake(me._dice1, point, Enums.HandState.DICES)
                    || me._hand.tryTake(me._dice2, point, Enums.HandState.DICES)

                if (diceTaked)
                    me._setState(Enums.GameState.SECOND_DICE_TAKED);

                break;
            }

            case Enums.GameState.SECOND_DICE_TAKED: {

                var success = me._hand.tryDrop(point);

                if (!success)
                    return;

                const first = 1; //Phaser.Math.Between(1, 6);
                const second = 0; //Phaser.Math.Between(1, 6);

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
                    me._setState(Enums.GameState.PIECE_TAKED);

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

                const fieldConfig = Config.Fields[field.index];
                const player = me._getCurrentPlayer(); // TODO : move to outer scope
                if (fieldConfig.type == Enums.FieldType.PROPERTY) {
                    
                    const enemy = Utils.firstOrDefault(
                        me._players, 
                        (p) => p.index != me._status.player && p.hasField(field.index));

                    if (!!enemy) {
                        const rent = enemy.getRent(field.index);
                        
                        if (rent > player.getTotalMoney()) {
                            me._killPlayer();
                            return;
                        }

                        const msg = `player ${Utils.enumToString(Enums.PlayerIndex, me._status.player)} should pay rent: ${rent}`;
                        Utils.debugLog(msg);

                        enemy.showButtons([Enums.ButtonType.UNKNOWN]);
                        me._setState(Enums.GameState.PIECE_ON_ENEMY_PROPERTY);
                        return;
                    }

                    const canBuyProperty = fieldConfig.cost <= player.getTotalMoney();
                    if (canBuyProperty) {
                        player.showButtons([Enums.ButtonType.BUY_FIELD, Enums.ButtonType.NEXT_TURN]);
                        me._setState(Enums.GameState.PIECE_ON_FREE_PROPERTY);
                        return;
                    }
                }

                me._setState(Enums.GameState.FINAL);

                break;
            }

            case Enums.GameState.PIECE_ON_FREE_PROPERTY: {

                const player = me._players[me._status.player];
                const billIndex = player.findBillOnPoint(point);

                if (billIndex >= 0) {
                    me._hand.takeBill(billIndex);
                }
                else {
                    if (player.isButtonClick(point, Enums.ButtonType.NEXT_TURN))
                        return;

                    if (!player.isButtonClick(point, Enums.ButtonType.BUY_FIELD))
                        return;

                    const field = Config.Fields[me._status.targetPieceIndex];
                    const handMoney = me._hand.getTotalMoney();
                    if (handMoney < field.cost)
                        return;

                    me._hand.dropMoney();
                    const diff = Utils.splitValueToBills(handMoney - field.cost);
                    player.addMoney(diff);
                    player.addProperty(me._status.targetPieceIndex);

                    me._finishTurn();
                }

                break;
            }

            case Enums.GameState.PIECE_ON_ENEMY_PROPERTY: {

                const player = me._players[me._status.player];
                const billIndex = player.findBillOnPoint(point);

                if (billIndex >= 0) {
                    me._hand.takeBill(billIndex);
                }
                else {
                    /** @type {Player} */
                    const enemy = Utils.single(me._players, (p) => p.hasField(me._status.targetPieceIndex));
                    if (!enemy.isButtonClick(point, Enums.ButtonType.UNKNOWN))
                        return;

                    const rent = enemy.getRent(me._status.targetPieceIndex);
                    const handMoney = me._hand.getTotalMoney();
                    if (handMoney < rent)
                        return;

                    const money = me._hand.dropMoney();
                    const diff = Utils.splitValueToBills(handMoney - rent);
                    player.addMoney(diff);                 
                    enemy.addMoney(Utils.splitValueToBills(rent));
                    enemy.showButtons([]);

                    me._setState(Enums.GameState.FINAL);
                }

                break;
            }

            case Enums.GameState.OWN_FIELD_SELECTED: {

                const player = me._getCurrentPlayer();
                if (!player.isButtonClick(point, Enums.ButtonType.SELL))
                    return;

                player.removeProperty(me._status.selectedField);
                const money = Utils.splitValueToBills(
                    Config.Fields[me._status.selectedField].cost / 2);
                player.addMoney(money);
            
                player.showButtons([]);
                me._setState(me._status.stateToReturn);
                Utils.debugLog(`sell field ${me._status.selectedField}`);

                break;
            }

            case Enums.GameState.FINAL: {

                if (me._getCurrentPlayer().isButtonClick(point, Enums.ButtonType.NEXT_TURN))
                    return me._finishTurn();

                break;
            }

            default: 
                throw `can't process state: ${Utils.enumToString(Enums.GameState, me._status.state)}`;
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

            case Enums.GameState.PIECE_ON_FREE_PROPERTY: {
                const cost = Config.Fields[me._status.targetPieceIndex].cost;
                const handMoney = me._hand.getTotalMoney();
                const diff = cost - handMoney;
                if (diff > 0) {
                    const position = me._getCurrentPlayer().getNextOptimalBillPosition(diff);
                    x = position.x;
                    y = position.y;
                } 
                else {
                    const position = me._getCurrentPlayer().getButtonPosition(Enums.ButtonType.BUY_FIELD);
                    x = position.x;
                    y = position.y;
                }
                break;
            }

            case Enums.GameState.PIECE_ON_ENEMY_PROPERTY: {
                /** @type {Player} */
                const enemy = Utils.single(me._players, (p) => p.hasField(me._status.targetPieceIndex));
                const rent = enemy.getRent(me._status.targetPieceIndex); // TODO : move rent to status property as targetIndex
                const handMoney = me._hand.getTotalMoney();
                const diff = rent - handMoney;
                if (diff > 0) {
                    const position = me._getCurrentPlayer().getNextOptimalBillPosition(diff);
                    x = position.x;
                    y = position.y;
                }
                else {
                    const position = enemy.getButtonPosition(Enums.ButtonType.UNKNOWN);
                    x = position.x;
                    y = position.y;
                }
                break;
            }

            case Enums.GameState.OWN_FIELD_SELECTED: {
            
                throw 'cpu OWN_FIELD_SELECTED state not implemented';

                break;
            }

            case Enums.GameState.FINAL: {
                const position = me._getCurrentPlayer().getButtonPosition(Enums.ButtonType.NEXT_TURN);
                x = position.x;
                y = position.y;

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
        me._setState(Enums.GameState.DICES_DROPED);
    }

    _cancelTurn() {
        const me = this;

        const money = me._hand.dropMoney();
        me._hand.cancel();

        me._players[me._status.player].addMoney(money);

        me._status.selectedField = null;
        const next = me._getNextStateAfterCancel();
        me._setState(next);
    }

    _getNextStateAfterCancel() {
        const me = this;

        switch (me._status.state) {
            case Enums.GameState.FIRST_DICE_TAKED:
            case Enums.GameState.SECOND_DICE_TAKED:
                return Enums.GameState.BEGIN;

            case Enums.GameState.PIECE_TAKED:
                return Enums.GameState.DICES_DROPED;

            case Enums.GameState.OWN_FIELD_SELECTED:
                return me._status.stateToReturn;
            
            default:
                return me._status.state;
        }
    }

    _finishTurn() {
        const me = this;

        do {
            me._status.player = (me._status.player + 1) % Config.PlayerCount;
        } while (Utils.all(me._status.activePlayers, (p) => p != me._status.player));
        
        for (let i = 0; i < me._players.length; ++i)
            me._players[i].showButtons(i == me._status.player);

        me._setState(Enums.GameState.BEGIN);
    }

    //TODO: refactor all occurences
    _getCurrentPlayer() {
        const me = this;

        return me._players[me._status.player];
    }

    _killPlayer() {
        const me = this;

        if (me._status.player == Enums.PlayerIndex.HUMAN) {
            throw 'YOU LOSE!';
        }

        me._status.activePlayers = me._status.activePlayers.filter((p) => p != me._status.player);

        if (me._status.activePlayers.length == 1) {
            throw 'YOU WIN!!!'
        }        

        Utils.debugLog(`Player ${Utils.enumToString(Enums.PlayerIndex, me._status.player)} lose!`);

        me._finishTurn();
    }

    _trySelectOwnField(point) {
        const me = this;

        const field = me._fields.getFieldIndex(point);
        if (!field)       
            return false;

        if (!Utils.contains(Consts.BuyableFieldTypes, Config.Fields[field].type))
            return false;

        const player = me._getCurrentPlayer();
        if (!player.hasField(field))
            return false;

        me._status.selectedField = field;
        me._status.stateToReturn = me._status.state;
        player.showButtons([Enums.ButtonType.SELL]);

        Utils.debugLog(`select field ${field}`);
        return true;
    }

    // TODO : it's necessary?
    _setState(state) {
        const me = this;

        if (Utils.contains(Consts.States.Final, state)) {
            me._getCurrentPlayer().showButtons([Enums.ButtonType.NEXT_TURN]);
        }

        me._status.setState(state);
    }
}