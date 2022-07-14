import Phaser from '../../lib/phaser.js';

import AI from '../Entities/AI.js';

import Consts from '../Consts.js';
import Enums from '../Enums.js';
import FieldInfo from '../FieldInfo.js';
import Utils from '../Utils.js';

import State from './State.js';

export default class PieceTakedState extends State {

    /** 
     * @returns {Number}
     */
    getName() {
        return Enums.GameState.PIECE_TAKED;
    }

    /**
     * @param {Phaser.Geom.Point} point
     */
    processTurn(point) {
        const me = this,
              context = me.core._context,
              status = context.status,
              hand = me.core.getCurrent().hand;

        const nextField = context.fields.tryMoveToFieldAtPoint(
            status.player,
            status.pieceIndicies[status.player],
            point);

        if (!nextField || nextField.index != status.targetFieldIndex)
            return;

        hand.tryMakeAction(
            nextField.position,
            Enums.HandAction.DROP_PIECE,
            null,
            () => { me._onPieceDrop(nextField) }
        );
    }

    /**
     * @returns {Number}
     */
    getNextStateAfterCancel() {
        const me = this;

        return Enums.GameState.DICES_DROPED;
    }

    /**
     */
    restoreSelection() {
        const me = this,
              context = me.core._context;

        context.pieces[Enums.Player.HUMAN].unselect();
        context.fields.at(context.status.targetFieldIndex).select();
    }

    /**
     * @param {AI} ai 
     * @returns {Phaser.Geom.Point}
     */
    getAiNextPoint(ai) {
        const me = this,
              context = me.core._context;

        return context.fields.getFieldPosition(context.status.targetFieldIndex);
    }

    _onPieceDrop(field) {
        const me = this,
              current = me.core.getCurrent(),
              context = me.core._context,
              status = context.status;

        status.pieceIndicies[status.player] = status.targetFieldIndex;

        const fieldConfig = FieldInfo.Config[field.index];

        if (fieldConfig.type == Enums.FieldType.GOTOJAIL)
            return me.core._moveToJail(field.index);

        if (!Utils.contains(Consts.BuyableFieldTypes, fieldConfig.type))
            return me.core._setState(Enums.GameState.FINAL);
            
        const enemyIndex = Utils.firstOrDefaultIndex(
            context.players, 
            (p) => p.index != status.player && p.hasField(field.index));

        if (enemyIndex != null) 
            return me._onMoveToEnemyField(enemyIndex, field);

        const canBuyField = !current.player.hasField(field.index)
                            && (me.core._isHumanTurn() 
                                || current.ai.canBuyField(field.index))
                            && fieldConfig.type != Enums.FieldType.RAILSTATION;

        if (canBuyField) {
            context.status.setPayAmount(fieldConfig.cost);
            return me.core._setState(Enums.GameState.PIECE_ON_FREE_FIELD);
        }

        return me.core._setState(Enums.GameState.FINAL)
    }

    _onMoveToEnemyField(enemyIndex, field) {
        const me = this,
              current = me.core.getCurrent(),
              context = me.core._context,
              status = context.status;

        const rent = context.players[enemyIndex].getRent(field.index, status.diceResult);
            
        if (rent > current.player.getTotalMoney())
            return me.core._killPlayer();

        status.setPayAmount(rent);

        context.hands[enemyIndex].prepareToRent();
        
        return me.core._setState(Enums.GameState.PIECE_ON_ENEMY_FIELD);
    }
}