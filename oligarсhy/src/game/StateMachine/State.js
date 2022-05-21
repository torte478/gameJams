import Phaser from '../../lib/phaser.js';

import AI from '../Entities/AI.js';

import Enums from '../Enums.js';
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

        const stateStr = Utils.enumToString(Enums.GameState, me.core_context.status.state);
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
}