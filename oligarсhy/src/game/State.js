import Config from './Config.js';
import Consts from './Consts.js';
import Enums from './Enums.js';
import Utils from './Utils.js';

export default class State {

    /** @type {Number[]} */
    _pieceIndicies;

    /** @type {Number} */
    current;

    /** @type {Number} */
    nextPieceIndex;

    /**@type {Number} */
    player;

    /**
     * @param {Number[]} pieceIndicies 
     * @param {Number} player
     */
    constructor(pieceIndicies, firstPlayer) {
        const me = this;

        me._pieceIndicies = pieceIndicies;
        me.current = Enums.GameState.BEGIN;
        me.player = firstPlayer;
    }

    takeFirstDice() {
        const me = this;

        me._setCurrent(Enums.GameState.FIRST_DICE_TAKED);
    }

    takeSecondDice() {
        const me = this;

        me._setCurrent(Enums.GameState.SECOND_DICE_TAKED);
    }

    dropDices(first, second) {
        const me = this;

        me.nextPieceIndex = (me._pieceIndicies[me.player] + first + second) % Consts.FieldCount;
        me._setCurrent(Enums.GameState.DICES_DROPED);
    }

    takePiece() {
        const me = this;

        me._setCurrent(Enums.GameState.PIECE_TAKED);
    }

    dropPiece() {
        const me = this;

        me._pieceIndicies[me.player] = me.nextPieceIndex;
        me.player = (me.player + 1) % me._pieceIndicies.length;

        me._setCurrent(Enums.GameState.BEGIN);
    }

    cancelCurrentAction() {
        const me = this;

        const next = me._getNextStateAfterCancel();
        me._setCurrent(next);
    }

    _setCurrent(value) {
        const me = this;

        if (Config.DebugStateLog)
            console.log(
                `(${me.player + 1}): `
                + `${Utils.enumToString(Enums.GameState, me.current)} => `
                + `${Utils.enumToString(Enums.GameState, value)}`);

        me.current = value;
    }

    _getNextStateAfterCancel() {
        const me = this;

        switch (me.current) {
            case Enums.GameState.FIRST_DICE_TAKED:
            case Enums.GameState.SECOND_DICE_TAKED:
                return Enums.GameState.BEGIN;

            case Enums.GameState.PIECE_TAKED:
                return Enums.GameState.DICES_DROPED;
            
            default:
                return me.current;
        }
    }
}