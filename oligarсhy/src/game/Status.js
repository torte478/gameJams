import Config from './Config.js';
import Enums from './Enums.js';
import Utils from './Utils.js';

export default class Status {

    /** @type {Number[]} */
    pieceIndicies;

    /** @type {Number} */
    state;

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

        me.pieceIndicies = pieceIndicies;
        me.state = Enums.GameState.BEGIN;
        me.player = firstPlayer;
    }

    cancelCurrentAction() {
        const me = this;

        const next = me._getNextStateAfterCancel();
        me.setState(next);
    }

    setState(value) {
        const me = this;

        if (Config.DebugStateLog)
            console.log(
                `(${me.player + 1}): `
                + `${Utils.enumToString(Enums.GameState, me.state)} => `
                + `${Utils.enumToString(Enums.GameState, value)}`);

        me.state = value;
    }
}