import Phaser from '../../lib/phaser.js';

import Config from '../Config.js';
import Consts from '../Consts.js';
import Utils from '../Utils.js';
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
            const position = board.getFieldPosition(playerIndex, config.positions[i]);
            const piece = new Piece(scene, position, playerIndex, Consts.PieceScale.Normal);
            me._pieces.push(piece);
        }

        me._storage = [];
        const storagePosition = board.getStoragePosition(playerIndex);
        for (let i = 0; i < config.count - me._pieces.length; ++i) {
            const index = me._storage.length;
            const position = Utils.buildPoint(
                storagePosition.x + Consts.StorageSize.Width - index * Consts.UnitSmall - Consts.UnitSmall,
                storagePosition.y + Consts.StorageSize.Height + Consts.UnitSmall / 2
            );
            const piece = new Piece(scene, position, playerIndex, Consts.PieceScale.Storage);
            me._storage.push(piece);
        }
    }
}