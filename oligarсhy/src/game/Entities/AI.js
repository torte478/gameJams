import Config from "../Config.js";
import Consts from "../Consts.js";
import Enums from "../Enums.js";
import Context from "./Context.js";
import Hand from "./Hand.js";
import Player from "./Player.js";
import Utils from "../Utils.js";
import Helper from "../Helper.js";
import FieldInfo from '../FieldInfo.js';

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

    /** @type {Object} */
    _billSeq = {
        /** @type {Number[]} */
        bills: null,

        /** @type {Number} */
        index: null
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
        
        me._billSeq.bills = null;
        me._billSeq.index = null;
    }

    canBuyField(index) {
        const me = this;

        if (Config.Debug.Global && Config.Debug.CancelAiBuy)
            return false;

        return FieldInfo.Config[index].cost <= me._player.getBillsMoney();
    }

    _tryManage() {
        const me = this;

        const point = me._tryProcessInnerState();
        if (point != null)
            return point;
        
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

    _tryProcessInnerState() {
        const me = this;

        if (me._state == null)
            return null;

        switch (me._state.action) {
            case Enums.AiAction.FINISH_TURN:
                return me._player.getButtonPosition(Enums.ActionType.NEXT_TURN);    

            case Enums.AiAction.MERGE_MONEY:
                if (me._hand.getTotalMoney() <  me._state.config.total)
                    return me._state.config.pos;

                me._state.action = Enums.AiAction.FINISH_TURN;
                return me._player.getButtonPosition(Enums.ActionType.MERGE_MONEY);        

            case Enums.AiAction.SPLIT_MONEY:
                me._state.action = Enums.AiAction.FINISH_TURN;
                return me._player.getButtonPosition(Enums.ActionType.SPLIT_MONEY);

            default:
                return null;
                
        }
    }

    _tryFindBillToSplit() {
        const me = this;

        const bills = me._player.enumBills();

        for (let i = Consts.BillCount - 2; i >= 0; --i) {
            if (bills[i] != 0)
                continue;

            for (let j = i + 1; j < Consts.BillCount; ++j) {
                if (bills[j] >= 1) {
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

            const cost = FieldInfo.Config[i].costHouse;
            if (me._player.getBillsMoney() < cost)
                continue;

            me._context.status.setPayAmount(cost);
            me._state.action = Enums.AiAction.BUY_HOUSE;
            return me._context.fields.getFieldPosition(i);
        }

        return null;
    }

    _calcBillSequence(bills, total) {
        const me = this;

        me._billSeq.bills = [];
        me._billSeq.index = 0;

        const optimalBills = me._getOptimalBills(bills, total);

        for (let i = optimalBills.length - 1; i >= 0; --i)
            for (let j = 0; j < optimalBills[i]; ++j)
                me._billSeq.bills.push(i);
    }

    _getOptimalBills(available, total) {
        const me = this;

        if (Helper.getTotalMoney(available) < total)
            throw `can't build optimal bill sequence`;

        const result = me._tryGetOptimalBills(available, total, true);

        return result != null
            ? result
            : me._tryGetOptimalBills(available, total, false);
    }

    _tryGetOptimalBills(available, total, limited) {
        let amount = total;
        let bill = Consts.BillCount - 1;
        const result = Utils.buildArray(Consts.BillCount, 0)
        while (amount > 0 && bill >= 0) {
            const canAddBill = result[bill] < available[bill] 
                && (!limited || Consts.BillValue[bill] <= amount);

            if (canAddBill) {
                amount -= Consts.BillValue[bill];
                ++result[bill];
            } else {
                --bill;
            }
        }

        return amount <= 0
            ? result
            : null;
    }

    _getNextBillPosition() {
        const me = this;

        if (me._billSeq == null || me._billSeq.bills == null)
            throw `bill sequence isn't initiaited`;

        if (me._billSeq.index < 0 || me._billSeq.index >= me._billSeq.bills.length)
            throw `wrong bill sequence index ${me._billSeq.index}`;

        const bill = me._billSeq.bills[me._billSeq.index];
        ++me._billSeq.index;

        return me._player.getBillPosition(bill);
    }
}