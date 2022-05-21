import Phaser from '../../lib/phaser.js';
import Core from '../Core.js';

import AI from '../Entities/AI.js';

import Enums from '../Enums.js';
import Utils from '../Utils.js';

import State from './State.js';

export default class PieceOnEnemyFieldState extends State {

    /** 
     * @returns {Number}
     */
    getName() {
        return Enums.GameState.PIECE_ON_ENEMY_FIELD;
    }

    /**
     * @param {Phaser.Geom.Point} point
     */
    processTurn(point) {
        const me = this,
              current = me.core.getCurrent(),
              hand = current.hand;

        if (me.core._tryManageMoney(point))
            return;
        
        const enemy = me._findEnemyByHandClick(point);

        if (!enemy)
            return;

        hand.tryMakeAction(
            point,
            Enums.HandAction.CLICK_BUTTON,
            null,
            () => { me._payRent(enemy, point) });
    }

    /**
     */
    restoreSelection() {
        const me = this;

        me.core._context.fields.unselectAll();
    }

    /**
     * @param {AI} ai 
     * @returns {Phaser.Geom.Point}
     */
    getAiNextPoint(ai) {
        const me = this,
              context = me.core._context,
              current = me.core.getCurrent(),
              hand = current.hand;

        const fieldToSell = me._findFieldToSellPos();
        if (!!fieldToSell)
            return fieldToSell;
        
        const needMoreBills = !hand.isMaxBillCount() && me._isNeedMoreBills(ai);
        if (needMoreBills)
            return ai._getNextBillPosition();

        const enemy = me._getEnemy()
        const enemyHand = context.hands[enemy.index].toPoint();
        return enemyHand;
    }

    _isNeedMoreBills(ai) {
        const me = this,
              context = me.core._context,
              current = me.core.getCurrent(),
              hand = current.hand,
              player = current.player;

        const handMoney = hand.getTotalMoney();
        if (handMoney == 0)
            ai._calcBillSequence(player.enumBills(), context.status.payAmount);

        return (context.status.payAmount - handMoney) > 0;
    }

    _findFieldToSellPos() {
        const me = this,
              /** @type {Core} */
              core = me.core,
              context = core._context,
              current = core.getCurrent(),
              hand = current.hand,
              player = current.player;

        const money = player.getBillsMoney() + hand.getTotalMoney();
        if (money >= context.status.payAmount)
            return null;

        const field = player.getRichestFieldIndex();
        return context.fields.getFieldPosition(field);
    }

    _payRent(enemy, point) {
        const me = this,
              /** @type {Core} */
              core = me.core,
              context = core._context,
              current = core.getCurrent(),
              hand = current.hand,
              player = current.player;

        const handMoney = hand.dropMoney();
        const remain = context.status.updatePayAmount(handMoney);

        if (remain > 0)
            return;

        core._addMoney(-remain, point, player);

        const rent = enemy.getRent(context.status.targetFieldIndex);
        core._addMoney(rent, point, enemy);
        context.hands[enemy.index].toWaitPosition();

        core._setState(Enums.GameState.FINAL);
    }

    _findEnemyByHandClick(point) {
        const me = this,
              context = me.core._context,
              enemy = me._getEnemy();

        const isEnemyHandClick = context.hands[enemy.index].isClick(point);

        if (!isEnemyHandClick)
            return null;

        return enemy;
    }

    _getEnemy() {
        const me = this,
              context = me.core._context;

        return Utils.single(
            context.players, 
            (p) => p.hasField(context.status.targetFieldIndex));
    }
}