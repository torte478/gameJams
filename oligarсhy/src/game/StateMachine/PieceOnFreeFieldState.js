import Phaser from '../../lib/phaser.js';
import Core from '../Core.js';

import AI from '../Entities/AI.js';

import Enums from '../Enums.js';
import FieldInfo from '../FieldInfo.js';
import Utils from '../Utils.js';

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
              current = me.core.getCurrent(),
              player = current.player,
              hand = current.hand;

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
            () => me._tryBuyField(point));
    }

    /**
     */
    restoreSelection() {
        const me = this,
              /** @type {Core} */
              core = me.core;

        core._context.fields.unselectAll();
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


        const needMoreBills = me._isNeedMoreBills(ai);
        const canTakeMoreBills = !hand.isMaxBillCount();
        return needMoreBills && canTakeMoreBills
            ? ai._getNextBillPosition()
            : player.getButtonPosition(Enums.ActionType.BUY_FIELD);
    }

    _isNeedMoreBills(ai) {
        const me = this,
              current = me.core.getCurrent(),
              hand = current.hand,
              player = current.player;

        const fieldIndex = me.core._context.status.targetFieldIndex; 
        const cost = FieldInfo.Config[fieldIndex].cost;
        const handMoney = hand.getTotalMoney();

        // TODO: to getNextBillPosition
        if (handMoney == 0) {
            Utils.debugLog('ai build bill sequence');
            ai._calcBillSequence(player.enumBills(), cost);
        }

        return (cost - handMoney) > 0
    }

    _tryBuyField(point) {
        const me = this;

        var remain = me._spendHandMoney();

        if (remain <= 0)
            me._buyField(point, remain);
    }

    _spendHandMoney() {
        const me = this,
              status = me.core._context.status,
              hand = me.core.getCurrent().hand;

        const handMoney = hand.dropMoney();
        return status.updatePayAmount(handMoney);
    }

    _buyField(point, remain) {
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