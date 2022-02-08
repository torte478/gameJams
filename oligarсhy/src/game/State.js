import Enums from './Enums.js';
import Global from './Global.js';

export default class State {

    /** @type {Number} */
    _pieceIndex;

    /** @type {Number} */
    current;

    /** @type {Number} */
    nextPieceIndex;

    /**@type {Number} */
    player;

    /**
     * @param {Number} pieceIndex 
     */
    constructor(pieceIndex) {
        const me = this;

        me._pieceIndex = pieceIndex;
        me.current = Enums.GameState.BEGIN;
        me.player = Enums.PlayerType.HUMAN;
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

        me.nextPieceIndex = (me._pieceIndex + first + second) % Global.FieldCount;
        me._setCurrent(Enums.GameState.DICES_DROPED);
    }

    takePiece() {
        const me = this;

        me._setCurrent(Enums.GameState.PIECE_TAKED);
    }

    dropPiece() {
        const me = this;

        me._pieceIndex = me.nextPieceIndex;
        me._setCurrent(Enums.GameState.BEGIN);
    }

    _setCurrent(value) {
        const me = this;

        //TODO : to human read && own Debug flag
        console.log(`(${me.player}): ${me.current} => ${value}`);

        me.current = value;
    }
}