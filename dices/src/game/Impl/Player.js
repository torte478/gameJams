import Phaser from '../../lib/phaser.js';

import Config from '../Config.js';
import Consts from '../Consts.js';
import Utils from '../Utils.js';
import Board from './Board.js';
import Cell from './Cell.js';
import Piece from './Piece.js';

export default class Player {

    /** @type {Number} */
    _index;

    /** @type {Piece[]} */
    _storage;

    /** @type {Piece[]} */
    _pieces;

    /** @type {Board} */
    _board;

    /**
     * @param {Phaser.Scenes} scene 
     * @param {Board} board 
     * @param {Number} playerIndex 
     */
    constructor(scene, board, playerIndex) {
        const me = this;

        me._index = playerIndex;
        me._board = board;

        const config = Config.Start[playerIndex];

        me._pieces = [];
        const pieceCount = !!config.positions ? config.positions.length : 0;
        for (let i = 0; i < pieceCount; ++i) {
            const cell = board.getCell(playerIndex, config.positions[i]);
            const piece = new Piece(scene, cell, playerIndex, Consts.PieceScale.Normal);
            me._pieces.push(piece);
        }

        me._storage = [];
        const storagePosition = board.getStoragePosition(playerIndex);
        for (let i = 0; i < config.count - me._pieces.length; ++i) {
            const index = me._storage.length;
            const cell = new Cell({
                player: playerIndex,
                x: storagePosition.x + Consts.StorageSize.Width - index * Consts.UnitSmall - Consts.UnitSmall,
                y: storagePosition.y + Consts.StorageSize.Height + Consts.UnitSmall / 2
            });
            const piece = new Piece(scene, cell, playerIndex, Consts.PieceScale.Storage);
            me._storage.push(piece);
        }
    }

    /**
     * @param {Number} value 
     * @returns {Object[]}
     */
    getAvailableSteps(value) {
        const me = this;

        const steps = [];
        for (let i = 0; i < me._pieces.length; ++i) {
            const piece = me._pieces[i];
            const target = me._board.getCell(me._index, piece.cell.index + value);

            const isAvailable = target.index != Consts.Undefined
                                && Utils.all(me._pieces, (p) => p.cell.index != target.index);

            if (isAvailable)
                steps.push({ from: piece.cell, to: target });
        }
        return steps;       
    }

    /**
     * @param {Cell} from 
     * @param {Cell} to 
     * @param {Function} callback
     * @param {Object} context
     */
     makeStep(from, to, callback, context) {
        const me = this;

        const piece = Utils.firstOrNull(me._pieces, p => p.cell.index === from.index);
        if (piece === null)
            throw `can't find piece on cell: ${from.index}`;

        piece.makeStep(to, callback, context);
    }
}