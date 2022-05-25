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
            return me._stopDark();

        me._updateDarkGame(delta);
    }

    /**
     */
    unpause() {
        const me = this,
              /** @type {Core} */
              core = me.core;

        core._timers[Enums.TimerIndex.DARK].resume();    
    }

    _stopDark() {
        const me = this,
              /** @type {Core} */
              core = me.core;

        core._timers[Enums.TimerIndex.LIGHT].reset();
        core._timers[Enums.TimerIndex.TURN].reset();
        core._timers[Enums.TimerIndex.DARK].pause();

        core._desk.setVisible(true);
        core._cards.stopDark();
        core._context.stopDark();

        core._setState(Enums.GameState.BEGIN);
    }

    _updateDarkGame() {
        const me = this,
              /** @type {Core} */
              core = me.core;
    }
}