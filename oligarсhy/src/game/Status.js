import Config from './Config.js';
import Consts from './Consts.js';
import Enums from './Enums.js';
import Utils from './Utils.js';

//TODODO: replace logic to Core
export default class Status {

    /** @type {Number[]} */
    pieceIndicies; //TODOO: ?

    /** @type {Number} */
    state;

    /** @type {Number} */
    nextPieceIndex; //TODOOD: ?

    /**@type {Number} */
    player;

    /**
     * @param {Number[]} pieceIndicies 
     * @param {Number} player
     */
    constructor(pieceIndicies, firstPlayer) {
        const me = this;

        me.pieceIndicies = pieceIndicies;
        me.state = Enums.GameState.BEGIN;
        me.player = firstPlayer;
    }

    takeFirstDice() {
        const me = this;

        me._setState(Enums.GameState.FIRST_DICE_TAKED);
    }

    takeSecondDice() {
        const me = this;

        me._setState(Enums.GameState.SECOND_DICE_TAKED);
    }

    dropDices(first, second) {
        const me = this;

        me.nextPieceIndex = (me.pieceIndicies[me.player] + first + second) % Consts.FieldCount;
        me._setState(Enums.GameState.DICES_DROPED);
    }

    takePiece() {
        const me = this;

        me._setState(Enums.GameState.PIECE_TAKED);
    }

    dropPiece() {
        const me = this;

        me.pieceIndicies[me.player] = me.nextPieceIndex;
        me.player = (me.player + 1) % me.pieceIndicies.length;

        me._setState(Enums.GameState.BEGIN);
    }

    cancelCurrentAction() {
        const me = this;

        const next = me._getNextStateAfterCancel();
        me._setState(next);
    }

    _setState(value) {
        const me = this;

        if (Config.DebugStateLog)
            console.log(
                `(${me.player + 1}): `
                + `${Utils.enumToString(Enums.GameState, me.state)} => `
                + `${Utils.enumToString(Enums.GameState, value)}`);

        me.state = value;
    }

    _getNextStateAfterCancel() {
        const me = this;

        switch (me.state) {
            case Enums.GameState.FIRST_DICE_TAKED:
            case Enums.GameState.SECOND_DICE_TAKED:
                return Enums.GameState.BEGIN;

            case Enums.GameState.PIECE_TAKED:
                return Enums.GameState.DICES_DROPED;
            
            default:
                return me.state;
        }
    }
}