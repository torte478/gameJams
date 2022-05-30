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
     */
    constructor(pieceIndicies, startPlayer) {
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

        me._validateStateChange(value);

        Utils.ifDebug(
            Config.Debug.StateLog, 
            () => Utils.debugLog(
                `(${me.player + 1}): `
                + `${Utils.enumToString(Enums.GameState, me.state)} => `
                + `${Utils.enumToString(Enums.GameState, value)}`));

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

    /**
     * @returns {Number}
     */
    setNextPlayerIndex() {
        const me = this;
        me.player = me.getNextPlayerIndex();
        return me.player;
    }

    /**
     * @returns {Number}
     */
    getNextPlayerIndex() {
        const me = this;

        let next = me.player;
        do {
            next = (next + 1) % Config.PlayerCount;
        } while (Utils.all(me.activePlayers, (p) => p != next));

        return next;
    }

    isBuyHouseAvailable() {
        const me = this;

        return !me.buyHouseOnCurrentTurn 
            && (me.state == Enums.GameState.FINAL
                || me.state == Enums.GameState.PIECE_ON_FREE_FIELD);
    }

    /**
     * @returns {Number}
     */
    killCurrentPlayer() {
        const me = this;

        if (me.player == Enums.Player.HUMAN)
            return Enums.PlayerDeathResult.LOSS;

        me.activePlayers = me.activePlayers.filter(
            (p) => p != me.player);

        return me.activePlayers.length === 1
            ? Enums.PlayerDeathResult.WIN
            : Enums.PlayerDeathResult.CONTINUE;
    }

    _validateStateChange(value) {
        const me = this;

        if (me.state !== Enums.GameState.DARK)
            return;

        if (me.stateToReturn == null)
            throw 'unexpected dark state end. '
                + 'State to return is null';

        if (value !== me.stateToReturn)
            throw 'unexpected dark state end. '
                + `Expected ${Utils.enumToString(Enums.GameState, me.stateToReturn)} `
                + `, but actually ${Utils.enumToString(Enums.GameState, value)}`;
    }
}