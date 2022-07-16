import Phaser from '../../lib/phaser.js';

import Config from '../Config.js';
import Board from './Board.js';
import Piece from './Piece.js';

export default class Player {

    /** @type {Number} */
    _index;

    /** @type {Piece[]} */
    _storage;

    /** @type {Piece[]} */
    _pieces;

    /**
     * @param {Phaser.Scenes} scene 
     * @param {Board} board 
     * @param {Number} playerIndex 
     */
    constructor(scene, board, playerIndex) {
        const me = this;

        me._index = playerIndex;
        const config = Config.Start[playerIndex];

        me._pieces = [];
        const pieceCount = !!config.positions ? config.positions.length : 0;
        for (let i = 0; i < pieceCount; ++i) {
            const position = board.getPiecePosition(playerIndex, config.positions[i]);
            const piece = new Piece(scene, position, playerIndex);
            me._pieces.push(piece);
        }

        // me._storage = [];

        // const storageSize = !!config.positions ? config.positions.length : 0;
        // for (let i = 0; i < storageSize; ++i) {
        //     const piece = new Piece(scene, )
        // }
    }
}