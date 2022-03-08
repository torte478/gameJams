import Phaser from "../../lib/phaser.js";

import Config from "../Config.js";
import Consts from "../Consts.js";
import Enums from "../Enums.js";
import Context from "./Context.js";
import Hand from "./Hand.js";
import Player from "./Player.js";
import Utils from "../Utils.js";

export default class AI {

    /** @type {Player} */
    _player;

    /** @type {Hand} */
    _hand;

    /** @type {Context} */
    _context;

    /** @type {Object} */
    _state = {
        /** @type {Number} */
        action: null,

        /** @type {Object} */
        config: null
    }

    /**
     * @param {Number} index 
     * @param {Context} context 
     */
    constructor(index, context) {
        const me = this;

        me._player = context.players[index];
        me._hand = context.hands[index];
        me._context = context;
    }

    resetState() {
        const me = this;
        me._state.action = null;
        me._state.config = null;
    }

    nextPoint() {
        const me = this;

        if (me._context.status.isBusy || me._hand.isBusy())
            return null;

        switch (me._context.status.state) {
            case Enums.GameState.BEGIN:
                return Utils.toPoint(me._context.dice1.toGameObject())

            case Enums.GameState.FIRST_DICE_TAKED:
                return Utils.toPoint(me._context.dice2.toGameObject());

            case Enums.GameState.SECOND_DICE_TAKED: {

                if (me._context.status.isBusy)
                    return null;

                const zone = Consts.DiceZoneRect;

                const playerIndex = me._context.status.getNextPlayerIndex() != Enums.Player.HUMAN
                    ? me._context.status.player
                    : Enums.Player.HUMAN;

                const humanPos = Utils.toPoint(me._context.pieces[playerIndex].toGameObject());

                const randomPos = Utils.buildPoint(
                    humanPos.x + Utils.getRandom(-200, 200, 0),
                    humanPos.y + Utils.getRandom(-200, 200, 0));

                const target = Utils.buildPoint(
                    Math.max(zone.x, Math.min(zone.x + zone.width, randomPos.x)),
                    Math.max(zone.y, Math.min(zone.y + zone.height, randomPos.y)));

                return target;
            }

            case Enums.GameState.DICES_DROPED:
                return Utils.toPoint(me._context.pieces[me._context.status.player].toGameObject());

            case Enums.GameState.PIECE_TAKED:
                return me._context.fields.getFieldPosition(me._context.status.targetPieceIndex);

            case Enums.GameState.PIECE_ON_FREE_PROPERTY: {
                const cost = Config.Fields[me._context.status.targetPieceIndex].cost;
                const handMoney = me._hand.getTotalMoney();
                const diff = cost - handMoney;

                return diff > 0
                    ? me._player.getNextOptimalBillPosition(diff)
                    : me._player.getButtonPosition(Enums.ActionType.BUY_FIELD);
            }

            case Enums.GameState.PIECE_ON_ENEMY_PROPERTY: {

                const total = me._player.getBillsMoney() + me._hand.getTotalMoney();
                if (total < me._context.status.payAmount) {
                    const index = me._player.getRichestField();
                    return me._context.fields.getFieldPosition(index);
                }
                
                /** @type {Player} */
                const enemy = Utils.single(
                    me._context.players, 
                    (p) => p.hasField(me._context.status.targetPieceIndex));
                const handMoney = me._hand.getTotalMoney();
                const diff = me._context.status.payAmount - handMoney;

                return diff > 0
                    ? me._player.getNextOptimalBillPosition(diff)
                    : me._context.hands[enemy.index].toPoint();
            }

            case Enums.GameState.OWN_FIELD_SELECTED:  {
                if (me._context.status.stateToReturn == Enums.GameState.PIECE_ON_ENEMY_PROPERTY) {
                    const button = me._player.hasHouse(me._context.status.selectedField)
                        ? Enums.ActionType.SELL_HOUSE
                        : Enums.ActionType.SELL_FIELD;
                    return me._player.getButtonPosition(button);
                }

                const handMoney = me._hand.getTotalMoney();
                const diff = me._context.status.payAmount - handMoney;

                if (diff > 0)
                    return me._player.getNextOptimalBillPosition(diff);
                
                me._state.action = Enums.AiAction.FINISH_TURN;
                return me._player.getButtonPosition(Enums.ActionType.BUY_HOUSE);
            }
                
            // TODO : refactor
            case Enums.GameState.FINAL: {

                if (me._state.action == Enums.AiAction.FINISH_TURN)
                    return me._player.getButtonPosition(Enums.ActionType.NEXT_TURN);

                if (me._state.action == Enums.AiAction.MERGE_MONEY) {
                    if (me._hand.getTotalMoney() >= me._state.config.total) {
                        me._state.action = Enums.AiAction.FINISH_TURN;
                        return me._player.getButtonPosition(Enums.ActionType.MERGE_MONEY);    
                    } else {
                        return me._state.config.pos;
                    }
                }

                if (me._state.action == Enums.AiAction.SPLIT_MONEY) {
                    me._state.action = Enums.AiAction.FINISH_TURN;
                    return me._player.getButtonPosition(Enums.ActionType.SPLIT_MONEY);
                }

                const fieldToSelect = me._tryFindFieldToBuyHouse();
                if (fieldToSelect != null)
                    return fieldToSelect;

                const billToMerge = me._tryFindBillToMerge();
                if (billToMerge != null)
                    return billToMerge;

                const billToSplit = me._tryFindBillToSplit();
                if (billToSplit != null)
                    return billToSplit;

                me._state.action = Enums.AiAction.FINISH_TURN;
                return null;
            }

            default:
                const stateStr = Utils.enumToString(Enums.GameState, me._context.status.state);
                throw `CPU Error! Unknown state ${stateStr}`;
        }
    }

    canBuyField(index) {
        const me = this;

        if (Config.Debug.Global && Config.Debug.CancelAiBuy)
            return false;

        return Config.Fields[index].cost <= me._player.getBillsMoney();
    }

    _tryFindBillToSplit() {
        const me = this;

        const bills = me._player.enumBills();

        for (let i = Consts.BillCount - 2; i >= 0; --i) {
            if (bills[i] != 0)
                continue;

            for (let j = i + 1; j < Consts.BillCount; ++j) {
                if (bills[j] >= 2) {
                    me._state.action = Enums.AiAction.SPLIT_MONEY;
                    return me._player.getBillPosition(j);
                }
            }
        }

        return null;
    }

    _tryFindBillToMerge() {
        const me = this;

        const bills = me._player.enumBills();

        for (let i = 0; i < bills.length - 1; ++i)
            if (bills[i] >= Consts.SplitBillLimit[i]) {
                me._state.action = Enums.AiAction.MERGE_MONEY;
                me._state.config = {
                    total: Consts.BillValue[i + 1],
                    pos: me._player.getBillPosition(i)
                };
                return me._state.config.pos;
            }

        return null;
    }

    _tryFindFieldToBuyHouse() {
        const me = this;

        if (!me._context.status.isBuyHouseAvailable())
            return null;

        for (let i = Consts.FieldCount - 1; i >= 0; --i) {
            if (!me._player.hasField(i))
                continue;

            if (!me._player.canBuyHouse(i))
                continue;

            const cost = Config.Fields[i].costHouse;
            if (me._player.getBillsMoney() < cost)
                continue;

            me._context.status.setPayAmount(cost);
            me._state.action = Enums.AiAction.BUY_HOUSE;
            return me._context.fields.getFieldPosition(i);
        }

        return null;
    }
}