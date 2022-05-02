import Config from './Config.js';
import Enums from './Enums.js';
import Utils from './Utils.js';

export default class Status {

    /** @type {Number[]} */
    pieceIndicies;

    /** @type {Number} */
    state;

    /** @type {Number} */
    targetFieldIndex;

    /**@type {Number} */
    player;

    /** @type {Number[]} */
    activePlayers;

    /** @type {Number} */
    selectedField;

    /** @type {Number} */
    stateToReturn;

    /** @type {Boolean} */
    buyHouseOnCurrentTurn;

    /** @type {Number} */
    payAmount;

    /** @type {Number} */
    diceResult;

    /** @type {Boolean} */
    isBusy;

    /** @type {Boolean} */
    isPause;

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
        
        me.targetFieldIndex = me.pieceIndicies[me.player];

        me.reset();

        me.state = Enums.GameState.UNKNOWN;
    }

    cancelCurrentAction() {
        const me = this;

        const next = me._getNextStateAfterCancel();
        me.setState(next);
    }

    setState(value) {
        const me = this;

        if (Config.Debug.Global && Config.Debug.StateLog)
            Utils.debugLog(
                `(${me.player + 1}): `
                + `${Utils.enumToString(Enums.GameState, me.state)} => `
                + `${Utils.enumToString(Enums.GameState, value)}`);

        me.state = value;
    }

    reset() {
        const me = this;

        me.targetFieldIndex = null;
        me.selectedField = null;
        me.stateToReturn = null;
        me.buyHouseOnCurrentTurn = false;
        me.payAmount = 0;
        me.diceResult = 0;
        me.isPause = false;
    }

    setPayAmount(value) {
        const me = this;

        if (me.payAmount !== 0)
            throw `payAmount isn't empty!`;

        me.payAmount = value;
        Utils.debugLog(`should pay ${value}`);
    }

    updatePayAmount(value) {
        const me = this;

        const diff = me.payAmount - value;
        if (diff < 0) {
            me.payAmount = 0;
            Utils.debugLog(`pay complete`);
        } else {
            me.payAmount -= value;
            Utils.debugLog(`should pay ${me.payAmount}`);   
        }
            
        return diff;
    }

    getNextPlayerIndex() {
        const me = this;

        let result = me.player;
        do {
            result = (result + 1) % Config.PlayerCount;
        } while (Utils.all(me.activePlayers, (p) => p != result));

        return result;
    }

    isBuyHouseAvailable() {
        const me = this;

        return !me.buyHouseOnCurrentTurn 
            && (me.state == Enums.GameState.FINAL
                || me.state == Enums.GameState.PIECE_ON_FREE_FIELD);
    }
}