import Phaser from '../../lib/phaser.js';

import Core from '../Core.js';
import Enums from '../Enums.js';

import State from './State.js';

export default class DarkState extends State {

    /** 
     * @returns {Number}
     */
    getName() {
        return Enums.GameState.DARK;
    }

    /**
     * @param {Number} delta 
     * @returns 
     */
    updateGame(delta) {
        const me = this,
              /** @type {Core} */
              core = me.core;

        if (core._timers[Enums.TimerIndex.DARK].check())
            return core._stopDark();

        core._updateDarkGame(delta);
    }

    /**
     */
    unpause() {
        const me = this,
              /** @type {Core} */
              core = me.core;

        core._timers[Enums.TimerIndex.DARK].resume();    
    }
}