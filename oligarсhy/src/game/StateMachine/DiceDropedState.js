import Phaser from '../../lib/phaser.js';

import AI from '../Entities/AI.js';

import Enums from '../Enums.js';
import Utils from '../Utils.js';

import State from './State.js';

export default class DiceDropedState extends State {

    /** 
     * @returns {Number}
     */
    getName() {
        return Enums.GameState.DICES_DROPED;
    }

    /**
     * @param {Phaser.Geom.Point} point
     */
    processTurn(point) {
        const me = this,
              hand = me.core.getCurrent().hand;

        hand.tryMakeAction(
            point,
            Enums.HandAction.TAKE_PIECE,
            {
                image: me._getPiece().toGameObject(),
                type: Enums.HandState.PIECE,
            },
            () => { me.core._setState(Enums.GameState.PIECE_TAKED) });
    }

    /**
     */
    restoreSelection() {
        const me = this;

        me._getPiece().select();
    }

    /**
     * @param {AI} ai 
     * @returns {Phaser.Geom.Point}
     */
    getAiNextPoint(ai) {
        const me = this;

        return Utils.toPoint(me._getPiece().toGameObject());
    }

    _getPiece() {
        const me = this,
              index = me.core._context.status.player;

        return me.core._context.pieces[index];
    }
}