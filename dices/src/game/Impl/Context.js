import Phaser from '../../lib/phaser.js';
import Enums from '../Enums.js';
import Utils from '../Utils.js';

export default class State {

    /** @type {Object[]} */
    availableSteps;

    /** @type {Number} */
    state;

    /** @type {Number} */
    player;

    constructor() {
        const me = this;

        me.state = Enums.GameState.DICE_ROLL;
        me.player = Enums.Player.HUMAN;
    }

    /**
     * @param {Object[]} available 
     */
    setAvailableSteps(available) {
        const me = this;

        me.availableSteps = available;
        Utils.debugLog(me.availableSteps.map(
            step => `${step.from.index} => ${step.to.index}`));
    }

    setState(state) {
        const me = this;

        me.availableSteps = null;

        Utils.debugLog(`${Utils.enumToString(Enums.GameState, me.state)}`
                     + ` => ${Utils.enumToString(Enums.GameState, state)}`);
        me.state = state;
    }
}