import Config from './Config.js';
import Enums from './Enums.js';
import Utils from './Utils.js';

export default class Status {

    /** @type {Number[]} */
    pieceIndicies;

    /** @type {Number} */
    state;

    /** @type {Number} */
    targetPieceIndex;

    /**@type {Number} */
    player;

    /**
     * @param {Number[]} pieceIndicies 
     * @param {Number} player
     * @param {Number} startState
     */
    constructor(pieceIndicies, startPlayer, startState) {
        const me = this;

        me.pieceIndicies = pieceIndicies;
        me.player = startPlayer;
        
        me.targetPieceIndex = me.pieceIndicies[me.player];
        me.setState(startState);
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