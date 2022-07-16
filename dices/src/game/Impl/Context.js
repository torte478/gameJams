import Phaser from '../../lib/phaser.js';

export default class State {

    /** @type {Number[]} */
    _availableSteps;

    constructor() {
        const me = this;
    }

    /**
     * @param {Cell[]} available 
     */
    setAvailableSteps(available) {
        const me = this;

        me._availableSteps = available.map(cell => cell.index);
        console.log(me._availableSteps);
    }
}