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

    /** @type {Number} */
    roll;

    stepMaded;

    constructor() {
        const me = this;

        me.state = Enums.GameState.DICE_ROLL;
        me.player = Enums.Player.HUMAN;

        me.stepMaded = false;
    }

    /**
     * @param {Object[]} available 
     */
    setAvailableSteps(available) {
        const me = this;

        me.availableSteps = available;
        Utils.debugLog(me.availableSteps.map(
            step => !step.bonus
                    ? `${step.from.index} => ${step.to.index}`
                    : `bonus(${step.bonus})`));
    }

    setState(state) {
        const me = this;

        me.stepMaded = false;
        if (state == Enums.GameState.DICE_ROLL)
            me.step = null;

        Utils.debugLog(`${Utils.enumToString(Enums.GameState, me.state)}`
                     + ` => ${Utils.enumToString(Enums.GameState, state)}`);
        me.state = state;
    }

    setPlayer(player) {
        const me = this;

        me.player = player;

        Utils.debugLog(`player: ${player}`);
    }

    setRoll(value) {
        const me = this;

        me.roll = value;
    }
}