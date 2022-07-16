import Phaser from '../../lib/phaser.js';
import Config from '../Config.js';
import Enums from '../Enums.js';
import Board from './Board.js';
import Player from './Player.js';

export default class Players {
    
    /** @type {Player[]} */
    _players;

    /** @type {Number} */
    _current;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Board}
     */
    constructor(scene, board) {
        const me = this;

        me._players = Config.Start.map(
            (_, index) => new Player(scene, board, index));

        me._current = Enums.Player.HUMAN;
    }

    /**
     * @param {Number} value 
     * @returns {Number[]}
     */
    getAvailableSteps(value) {
        const me = this;

        return me._getCurrent().getAvailableSteps(value);
    }

    _getCurrent() {
        const me = this;

        return me._players[me._current];
    }
}