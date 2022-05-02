import Phaser from '../lib/phaser.js';

import AI from '../Entities/AI.js';

import Enums from '../Enums.js';
import FieldInfo from '../FieldInfo.js';
import Helper from '../Helper.js';

import State from './State.js';

export default class PieceOnFreeFieldState extends State {

    /** 
     * @returns {Number}
     */
    getName() {
        return Enums.GameState.PIECE_ON_FREE_FIELD;
    }

    /**
     * @param {Phaser.Geom.Point} point
     */
    processTurn(point) {
        const me = this,
              player = me.core.getCurrent().player;

        if (me.core._tryManageMoney(point))
            return;

        if (player.canClickButton(point, Enums.ActionType.NEXT_TURN))
            return me.core._finishTurn();

        if (!player.canClickButton(point, Enums.ActionType.BUY_FIELD))
            return;

        hand.tryMakeAction(
            point,
            Enums.HandAction.CLICK_BUTTON,
            null,
            me._tryBuyField);
    }

    /**
     */
    restoreSelection() {
        const me = this;

        me.core._context.fields.unselect();
    }

    /**
     */
    showButtons() {
        const me = this,
              player = me.core.getCurrent().player;

        player.showButtons([Enums.ActionType.BUY_FIELD, Enums.ActionType.NEXT_TURN]);
    }

    /**
     * @param {AI} ai 
     * @returns {Phaser.Geom.Point}
     */
    getAiNextPoint(ai) {
        const me = this,
              current = me.core.getCurrent(),
              hand = current.hand,
              player = current.player;

        return !hand.isMaxBillCount() && me._isNeedMoreBills(ai)
            ? ai._getNextBillPosition()
            : player.getButtonPosition(Enums.ActionType.BUY_FIELD);
    }

    _isNeedMoreBills(ai) {
        const me = this,
              current = me.core.getCurrent(),
              hand = current.hand,
              player = current.player;

        const fieldIndex = me.core.context.status.targetFieldIndex; 
        const cost = FieldInfo.Config[fieldIndex].cost;
        const handMoney = hand.getTotalMoney();

        // TODO: to getNextBillPosition
        if (handMoney == 0)
            ai._calcBillSequence(player.enumBills(), cost);

        return (cost - handMoney) > 0
    }

    _tryBuyField() {
        const me = this;

        var remain = me._spendHandMoney();

        if (remain <= 0)
            me._buyField(remain);
    }

    _spendHandMoney(hand) {
        const me = this,
              status = me.core._context.status,
              hand = me.core.getCurrent().hand;

        const handMoney = hand.dropMoney();
        return status.updatePayAmount(handMoney);
    }

    _buyField(remain) {
        const me = this,
              status = me.core._context.status,
              current = me.core.getCurrent(),
              player = current.player;

        const field = status.targetFieldIndex;

        me.core._buyField(field, player.index);
        me.core._updateRent(player.index);
        me.core._addMoney(-remain, point, player);

        status.buyHouseOnCurrentTurn = true;

        me.core._setState(Enums.GameState.FINAL);
    }
}