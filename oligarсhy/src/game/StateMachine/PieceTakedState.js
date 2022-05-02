import Phaser from '../lib/phaser.js';

import AI from '../Entities/AI.js';

import Enums from '../Enums.js';

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
              status = context.status;

        const nextField = context.fields.tryMoveToFieldAtPoint(
            status.player,
            status.pieceIndicies[status.player],
            point);

        if (nextField.index != status.targetFieldIndex)
            return;

        hand.tryMakeAction(
            nextField.position,
            Enums.HandAction.DROP_PIECE,
            null,
            () => { me.core._onPieceDrop(nextField)}
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
              context = me.core.context;

        context.pieces[Enums.Player.HUMAN].unselect();
        context.fields.select(context.status.targetFieldIndex);
    }

    /**
     * @param {AI} ai 
     * @returns {Phaser.Geom.Point}
     */
    getAiNextPoint(ai) {
        const me = this,
              context = me.core.context;

        return context.fields.getFieldPosition(context.status.targetFieldIndex);
    }
}