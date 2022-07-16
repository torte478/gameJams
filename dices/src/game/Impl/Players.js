import Phaser from '../../lib/phaser.js';

import Config from '../Config.js';
import Enums from '../Enums.js';
import Utils from '../Utils.js';
import Board from './Board.js';
import Cell from './Cell.js';
import Context from './Context.js';
import Player from './Player.js';

export default class Players {
    
    /** @type {Player[]} */
    _players;

    /** @type {Context} */
    _context;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Board}
     */
    constructor(scene, board, context) {
        const me = this;

        me._players = Config.Start.map(
            (_, index) => new Player(scene, board, index));

        me._context = context;
    }

    /**
     * @param {Number} value 
     * @returns {Object[]}
     */
    getAvailableSteps(value) {
        const me = this;

        return me._getCurrent().getAvailableSteps(value);
    }

    /**
     * @param {Cell} from 
     * @param {Cell} to 
     * @param {Function} callback
     * @param {Object} context
     */
    makeStep(from, to, callback, context) {
        const me = this;

        me._getCurrent().makeStep(from, to, callback, context);
    }


    tryKill(cell) {
        const me = this;

        for (let i = 0; i < me._players.length; ++i) {
            if (i == me._context.player)
                continue;

            if (me._players[i].tryKill(cell))
                return true;
        }

        return false;
    }

    _getCurrent() {
        const me = this;

        return me._players[me._context.player];
    }
}