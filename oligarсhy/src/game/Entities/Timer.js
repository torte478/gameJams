export default class Timer { 

    /** @type {Number} */
    _turn;

    /** @type {Number} */
    _finishTurn;

    /** @type {Boolean} */
    _isTurnRunning;

    /**
     * @param {Number} turn 
     */
    constructor(turn) {
        const me = this;

        me._turn = turn;
        me.resetTurn();
    }

    checkTurnFinish() {
        const me = this;

        if (!me._isTurnRunning)
            return false;

        const time = new Date().getTime();
        return time >= me._finishTurn;
    }

    resetTurn() {
        const me = this;

        me._finishTurn = new Date().getTime() + me._turn;
        me._isTurnRunning = true;
    }

    stopTurn() {
        const me = this;

        me._isTurnRunning = false;
    }
}