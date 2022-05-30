import Phaser from '../../lib/phaser.js';

import AI from '../Entities/AI.js';

import Enums from '../Enums.js';
import Core from '../Core.js';
import Utils from '../Utils.js';

export default class State {

    /** @type {Core} */
    core;

    /**
     * @param {Core} core 
     */
    constructor(core) {
        const me = this;

        me.core = core;
    }

    /** 
     * @returns {Number}
     */
    getName() {
        throw 'state name getter is not implemented!';
    }

    /**
     * @param {Phaser.Geom.Point} point
     */
    processTurn(point) {
        const me = this;

        const stateStr = Utils.enumToString(Enums.GameState, me.core._context.status.state);
        throw `can't process state: ${stateStr}`;
    }

    /**
     * @returns {Number}
     */
    getNextStateAfterCancel() {
        const me = this;

        return me.core._context.status.state;
    }

    /**
     */
    showButtons() {
    }

    /**
     */
    restoreSelection() {
    }

    /**
     * @param {AI} ai 
     * @returns {Phaser.Geom.Point}
     */
    getAiNextPoint(ai) {
        const me = this;

        const stateStr = Utils.enumToString(Enums.GameState, ai._context.status.state);
        throw `CPU Error! Unknown state ${stateStr}`;
    }

    /**
     * @param {Number} delta 
     * @returns 
     */
    updateGame(delta) {
        const me = this;

        if (me.core._timers[Enums.TimerIndex.LIGHT].check()) 
            return me._startDark();

        me.core._updateLightGame(delta);
    }

    /**
     */
    unpause() {
        const me = this;

        me.core._timers[Enums.TimerIndex.TURN].resume();
        me.core._timers[Enums.TimerIndex.LIGHT].resume();
    }

    _startDark() {
        const me = this;

        me.core._graphics.showDarkFade();

        me.core._cancelTurn(true);
        me.core._context.status.stateToReturn = me.core._gameState.getName();

        me.core._timers[Enums.TimerIndex.LIGHT].pause();
        me.core._timers[Enums.TimerIndex.TURN].pause();
        me.core._timers[Enums.TimerIndex.DARK].reset();

        me.core._desk.setVisible(false);
        me.core._cards.startDark();
        me.core._context.startDark();

        me.core._setState(Enums.GameState.DARK);
    }
}