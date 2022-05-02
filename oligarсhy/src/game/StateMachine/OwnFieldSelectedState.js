import Phaser from '../lib/phaser.js';

import AI from '../Entities/AI.js';

import Enums from '../Enums.js';
import FieldInfo from '../FieldInfo.js';
import Utils from '../Utils.js';

import State from './State.js';

export default class OwnFieldSelectedState extends State {

    /** 
     * @returns {Number}
     */
    getName() {
        return Enums.GameState.OWN_FIELD_SELECTED;
    }

    /**
     * @param {Phaser.Geom.Point} point
     */
    processTurn(point) {
        const me = this,
              current = me.core.getCurrent(),
              player = current.player,
              hand = current.hand;

        const isFieldSell = player.canClickButton(point, Enums.ActionType.SELL_FIELD);
        const isHouseSell = player.canClickButton(point, Enums.ActionType.SELL_HOUSE);

        if (isFieldSell || isHouseSell)
            return hand.tryMakeAction(
                point,
                Enums.HandAction.CLICK_BUTTON,
                null,
                () => { me._trySell(isFieldSell) });
        
        if (me.core._tryManageMoney(point))
            return;

        if (player.canClickButton(point, Enums.ActionType.BUY_HOUSE))
            hand.tryMakeAction(
                point,
                Enums.HandAction.CLICK_BUTTON,
                null,
                () => { me._tryBuyHouse(point) });
    }

    /**
     * @returns {Number}
     */
    getNextStateAfterCancel() {
        const me = this;

        return me.core._context.status.stateToReturn;
    }

    /**
     * @param {AI} ai 
     * @returns {Phaser.Geom.Point}
     */
    getAiNextPoint(ai) {
        const me = this,
              context = me.core._context,
              status = context.status,
              current = me.core.getCurrent(),
              player = current.player;

        if (status.stateToReturn == Enums.GameState.PIECE_ON_ENEMY_FIELD) {
            const button = player.hasHouse(status.selectedField)
                ? Enums.ActionType.SELL_HOUSE
                : Enums.ActionType.SELL_FIELD;
            return player.getButtonPosition(button);
        }

        const handMoney = hand.getTotalMoney();
        if (handMoney == 0)
            ai._calcBillSequence(player.enumBills(), status.payAmount);

        const diff = status.payAmount - handMoney;

        if (diff > 0 && !hand.isMaxBillCount())
            return ai._getNextBillPosition();
        
        if (diff <= 0)
            ai._state.action = Enums.AiAction.FINISH_TURN;

        return player.getButtonPosition(Enums.ActionType.BUY_HOUSE);
    }

    _tryBuyHouse(point) {
        const me = this,
              context = me.core._context,
              status = context.status,
              current = me.core.getCurrent(),
              player = current.player;

        const remain = me._updatePayAmount();
        if (remain > 0)
            return;

        const fieldIndex = status.selectedField;
        player.addHouse(fieldIndex, context.fields.getFieldPosition(fieldIndex));
        me.core._updateRent(player.index);
        me.core._addMoney(-remain, point, player);

        status.buyHouseOnCurrentTurn = true;
        me.core._setState(status.stateToReturn);
    }

    _updatePayAmount() {
        const me = this,
              context = me.core._context,
              status = context.status,
              hand = me.core.getCurrent().hand;

        const field = FieldInfo.Config[status.selectedField];

        if (status.stateToReturn == Enums.GameState.PIECE_ON_FREE_FIELD) {
            status.stateToReturn = Enums.GameState.FINAL;
            status.payAmount = 0;
        }

        if (status.payAmount == 0)
            status.setPayAmount(field.costHouse);

        const handMoney = hand.dropMoney();
        return context.status.updatePayAmount(handMoney);
    }

    _trySell(isFieldSell) {
        const me = this,
              context = me.core._context,
              player = me.core.getCurrent().player;

        const fieldIndex = context.status.selectedField;
        const cost = player.trySell(fieldIndex, context.fields.getFieldPosition(fieldIndex));
        if (cost == null)
            return;
    
        player.showButtons([]);

        me.core._updateRent(player.index);
        if (isFieldSell) {
            context.fields.sellField(fieldIndex);
            me.core._cards.sell(fieldIndex, player.index, player.getCardGrid());
        }

        me.core._addMoney(cost, point, player);

        Utils.debugLog(`SELL: ${Utils.enumToString(Enums.Player, player.index)} => ${fieldIndex}`);
        return me.core._setState(context.status.stateToReturn);
    }
}