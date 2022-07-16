import Phaser from '../../lib/phaser.js';
import Config from '../Config.js';
import Board from './Board.js';
import Player from './Player.js';

export default class Players {
    
    /** @type {Player[]} */
    _players;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Board}
     */
    constructor(scene, board) {
        const me = this;

        me._players = Config.Start.map(
            (_, index) => new Player(scene, board, index));
    }
}