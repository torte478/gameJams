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

    /** @type {Number[]} */
    activePlayers;

    /** @type {Number} */
    selectedField;

    /** @type {Number} */
    stateToReturn;

    /**
     * @param {Number[]} pieceIndicies 
     * @param {Number} player
     * @param {Number} startState
     */
    constructor(pieceIndicies, startPlayer, startState) {
        const me = this;

        me.pieceIndicies = pieceIndicies;

        if (startPlayer >= Config.PlayerCount)
            throw `Player index ${startPlayer} >= total player count ${Config.PlayerCount}`;
        me.player = startPlayer;

        me.activePlayers = [];
        for (let i = 0; i < Config.PlayerCount; ++i)
            me.activePlayers.push(i);
        
        me.targetPieceIndex = me.pieceIndicies[me.player];

        // TODO : add validators
        me.selectedField = null;
        me.stateToReturn = null;

        me.state = Enums.GameState.UNKNOWN;
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