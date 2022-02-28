import Phaser from '../lib/phaser.js';

import Fields from './Entities/Fields.js';
import Hand from './Entities/Hand.js';
import Player from './Entities/Player.js';

import Config from './Config.js';
import Consts from './/Consts.js';
import Enums from './/Enums.js';
import Groups from './Groups.js';
import HUD from './Entities/HUD.js';
import Status from './Status.js';
import Utils from './Utils.js';
import Helper from './Helper.js';

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

    /** @type {HUD} */
    _hud;

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

        const groups = new Groups(factory);
        me._players = [];
        for (let i = 0; i < Config.PlayerCount; ++ i) {
            const player = new Player(factory, i, Config.Start.Money, Config.Start.Fields[i], groups);
            me._players.push(player);
        }

        me._hud = new HUD(factory);

        me._setState(Enums.GameState.BEGIN);
    }
    
    /**
     * @param {Phaser.Geom.Point} point 
     * @param {Boolean} isRightButton 
     */
    processHumanTurn(point, isRightButton) {
        const me = this;

        if (!me._isHumanTurn())
            return;

        me._processTurn(point, isRightButton);
    }

    processCpuTurn() {
        const me = this;

        const point = me._getCpuPoint();
        me._processTurn(point, false);
    }

    debugDropDices(value) {
        const me = this;

        if (me._status.state == Enums.GameState.BEGIN) {
            Utils.debugLog(`debug drop: ${value}`);
            me._applyDiceDrop(value, 0);
        }
    }

    updateHud(deltaY) {
        const me = this;

        if (deltaY > 0)
            me._hud.show();
        else if (deltaY < 0)
            me._hud.hide();
    }

    onPointerMove(point) {
        const me = this;

        const index = me._fields.getFieldIndex(point);

        index != null
            ? me._hud.showField(index)
            : me._hud.hideField();
    }

    _isHumanTurn() {
        const me = this;

        return me._status.player == Enums.PlayerIndex.HUMAN;
    }

    /**
     * @param {Phaser.Geom.Point} point 
     * @param {Boolean} isCancel 
     */
     _processTurn(point, isCancel) {
        const me = this;

        if (isCancel)
            return me._cancelTurn();

        if (Utils.contains(Consts.States.Management, me._status.state)) {
            if (me._trySelectOwnField(point))
                return me._setState(Enums.GameState.OWN_FIELD_SELECTED);
        }

        const player = me._getCurrentPlayer();

        switch (me._status.state) {
            case Enums.GameState.BEGIN: {

                const diceTaked = 
                    me._hand.tryTake(me._dice1, point, Enums.HandState.DICES)
                    || me._hand.tryTake(me._dice2, point, Enums.HandState.DICES)

                if (!diceTaked)
                    return;
                
                return me._setState(Enums.GameState.FIRST_DICE_TAKED);
            }

            case Enums.GameState.FIRST_DICE_TAKED: {

                const diceTaked = 
                    me._hand.tryTake(me._dice1, point, Enums.HandState.DICES)
                    || me._hand.tryTake(me._dice2, point, Enums.HandState.DICES)

                if (!diceTaked)
                    return;

                return me._setState(Enums.GameState.SECOND_DICE_TAKED);
            }

            case Enums.GameState.SECOND_DICE_TAKED: {

                var dropped = me._hand.tryDrop(point);

                if (!dropped)
                    return;

                const first = Utils.GetRandom(1, 6, 1);
                const second = Utils.GetRandom(1, 6, 0);

                Utils.debugLog(`${first} ${second} (${first + second})`);

                return me._applyDiceDrop(first, second);
            }

            case Enums.GameState.DICES_DROPED: {
                
                const pieceTaked = me._hand.tryTake(
                    me._pieces[me._status.player], 
                    point, 
                    Enums.HandState.PIECE);

                if (!pieceTaked)
                    return;
                
                return me._setState(Enums.GameState.PIECE_TAKED);
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

                if (fieldConfig.type != Enums.FieldType.PROPERTY)
                    return me._setState(Enums.GameState.FINAL);
                    
                const enemy = Utils.firstOrDefault(
                    me._players, 
                    (p) => p.index != me._status.player && p.hasField(field.index));

                if (!!enemy) {
                    const rent = enemy.getRent(field.index);
                    
                    if (rent > player.getTotalMoney())
                        return me._killPlayer();

                    me._status.setPayAmount(rent);

                    enemy.showButtons([Enums.ButtonType.UNKNOWN]);
                    return me._setState(Enums.GameState.PIECE_ON_ENEMY_PROPERTY);
                }

                const canBuyProperty = fieldConfig.cost <= player.getTotalMoney();

                if (!player.hasField(field.index) && canBuyProperty) {
                    me._status.setPayAmount(fieldConfig.cost);
                    player.showButtons([Enums.ButtonType.BUY_FIELD, Enums.ButtonType.NEXT_TURN]);
                    me._setState(Enums.GameState.PIECE_ON_FREE_PROPERTY);
                    return;
                }

                return me._setState(Enums.GameState.FINAL)
            }

            case Enums.GameState.PIECE_ON_FREE_PROPERTY: {

                const billIndex = player.findBillOnPoint(point);

                if (billIndex >= 0)
                    return me._hand.takeBill(billIndex);

                if (player.isButtonClick(point, Enums.ButtonType.NEXT_TURN))
                    return me._finishTurn();

                if (!player.isButtonClick(point, Enums.ButtonType.BUY_FIELD))
                    return;

                const handMoney = me._hand.getTotalMoney();
                me._hand.dropMoney();
                const diff = me._status.updatePayAmount(handMoney);

                if (diff > 0)
                    return;

                const changeBills = Helper.splitValueToBills(-diff);
                player.addMoney(changeBills);
                player.addProperty(me._status.targetPieceIndex);

                return me._setState(Enums.GameState.FINAL);
            }

            case Enums.GameState.PIECE_ON_ENEMY_PROPERTY: {

                const billIndex = player.findBillOnPoint(point);

                if (billIndex >= 0) 
                    return me._hand.takeBill(billIndex);
                
                /** @type {Player} */
                const enemy = Utils.single(me._players, (p) => p.hasField(me._status.targetPieceIndex));
                if (!enemy.isButtonClick(point, Enums.ButtonType.UNKNOWN))
                    return;

                const handMoney = me._hand.getTotalMoney();
                me._hand.dropMoney();

                const change = me._status.updatePayAmount(handMoney);
                if (change > 0)
                    return;

                const changeBills = Helper.splitValueToBills(-change);
                player.addMoney(changeBills);                 
                
                const rent = enemy.getRent(me._status.targetPieceIndex);
                enemy.addMoney(Helper.splitValueToBills(rent));
                enemy.showButtons([]);

                return me._setState(Enums.GameState.FINAL);
            }

            case Enums.GameState.OWN_FIELD_SELECTED: {

                if (player.isButtonClick(point, Enums.ButtonType.SELL)) {
                    const index = me._status.selectedField;
                    const result = player.trySell(index, me._fields.getFieldPosition(index));
                    if (result == null)
                        return;

                    const money = Helper.splitValueToBills(result);
                    player.addMoney(money);
                
                    player.showButtons([]);
                    return me._setState(me._status.stateToReturn);
                }
                
                const billIndex = player.findBillOnPoint(point);

                if (billIndex >= 0)
                    return me._hand.takeBill(billIndex);

                const buyBuilding = player.isButtonClick(point, Enums.ButtonType.BUY_HOUSE) 
                                    || player.isButtonClick(point, Enums.ButtonType.BUY_HOTEL);

                if (!buyBuilding)
                    return;

                const field = Config.Fields[me._status.selectedField];

                if (me._status.payAmount == 0) {
                    me._status.setPayAmount(field.costHouse);
                }

                const handMoney = me._hand.getTotalMoney();
                me._hand.dropMoney();
                const diff = me._status.updatePayAmount(handMoney);
                if (diff > 0)
                    return;

                const changeBills = Helper.splitValueToBills(-diff);
                player.addMoney(changeBills);

                const fieldIndex = me._status.selectedField;
                player.addHouse(fieldIndex, me._fields.getFieldPosition(fieldIndex));

                me._status.buyHouseOnCurrentTurn = true;
                return me._setState(me._status.stateToReturn);

                break;
            }

            case Enums.GameState.FINAL: {

                if (player.isButtonClick(point, Enums.ButtonType.NEXT_TURN))
                    return me._finishTurn();

                break;
            }

            default: 
                throw `can't process state: ${Utils.enumToString(Enums.GameState, me._status.state)}`;
        }
    }

    _getCpuPoint() {
        const me = this;

        const player = me._getCurrentPlayer();

        switch (me._status.state) {
            case Enums.GameState.BEGIN:
                return Utils.toPoint(me._dice1)

            case Enums.GameState.FIRST_DICE_TAKED:
                return Utils.toPoint(me._dice2);

            case Enums.GameState.SECOND_DICE_TAKED:
                return Utils.buildPoint(
                    Utils.GetRandom(-100, 100, 0),
                    Utils.GetRandom(-100, 100, 0));

            case Enums.GameState.DICES_DROPED:
                return Utils.toPoint(me._pieces[me._status.player]);

            case Enums.GameState.PIECE_TAKED:
                return me._fields.getFieldPosition(me._status.targetPieceIndex);

            case Enums.GameState.PIECE_ON_FREE_PROPERTY: {
                const cost = Config.Fields[me._status.targetPieceIndex].cost;
                const handMoney = me._hand.getTotalMoney();
                const diff = cost - handMoney;

                return diff > 0
                    ? player.getNextOptimalBillPosition(diff)
                    : player.getButtonPosition(Enums.ButtonType.BUY_FIELD);
            }

            case Enums.GameState.PIECE_ON_ENEMY_PROPERTY: {
                /** @type {Player} */
                const enemy = Utils.single(me._players, (p) => p.hasField(me._status.targetPieceIndex));
                const handMoney = me._hand.getTotalMoney();
                const diff = me._status.payAmount - handMoney;

                return diff > 0
                    ? player.getNextOptimalBillPosition(diff)
                    : enemy.getButtonPosition(Enums.ButtonType.UNKNOWN);
            }

            case Enums.GameState.OWN_FIELD_SELECTED: 
                throw 'cpu OWN_FIELD_SELECTED state not implemented';

            case Enums.GameState.FINAL:
               return player.getButtonPosition(Enums.ButtonType.NEXT_TURN);

            default:
                const stateStr = Utils.enumToString(Enums.GameState, me._status.state);
                throw `CPU Error! Unknown state ${stateStr}`;
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

        me._getCurrentPlayer().addMoney(money);

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

        me._status.reset();
        me._setState(Enums.GameState.BEGIN);
    }

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

        const buttons = [];
        const action = player.getBuyAction(field);
        if (action != null && !me._status.buyHouseOnCurrentTurn)
            buttons.push(action);
        buttons.push(Enums.ButtonType.SELL);
        player.showButtons(buttons);

        Utils.debugLog(`select field ${field}`);
        return true;
    }

    _setState(state) {
        const me = this;

        if (Utils.contains(Consts.States.Final, state)) {
            me._getCurrentPlayer().showButtons([Enums.ButtonType.NEXT_TURN], true);
        }

        if (state == Enums.GameState.BEGIN)
            me._getCurrentPlayer().showButtons([]);

        me._status.setState(state);
    }
}