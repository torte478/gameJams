import Phaser from '../../lib/phaser.js';

import Config from '../Config.js';
import Consts from '../Consts.js';
import Enums from '../Enums.js';
import Utils from '../Utils.js';
import Board from './Board.js';
import Booster from './Booster.js';
import Cell from './Cell.js';
import Piece from './Piece.js';

export default class Player {

    /** @type {Number} */
    _playerIndex;

    /** @type {Piece[]} */
    _storage;

    /** @type {Piece[]} */
    _pieces;

    /** @type {Board} */
    _board;

    /** @type {Phaser.Geom.Point} */
    _storagePosition;

    /** @type {Carousel} */
    _carousel;

    /** @type {Booster} */
    _booster;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Board} board 
     * @param {Number} playerIndex 
     */
    constructor(scene, board, playerIndex, carousel, config) {
        const me = this;

        me._playerIndex = playerIndex;
        me._board = board;
        me._carousel = carousel;

        me._pieces = [];
        const pieceCount = !!config.positions ? config.positions.length : 0;
        for (let i = 0; i < pieceCount; ++i) {
            const cell = board.getCell(playerIndex, config.positions[i]);
            const frame = config.skin + i % (config.skin < 8 ? 2 : 4);
            const piece = new Piece(scene, cell, frame, Consts.PieceScale.Normal);
            me._pieces.push(piece);
        }

        me._storage = [];
        me._storagePosition = board.getStoragePosition(playerIndex);
        for (let i = 0; i < config.count - me._pieces.length; ++i) {
            const cell = me._getPositionInStorage();
            const frame = config.skin + i % (config.skin < 8 ? 2 : 4);
            const piece = new Piece(scene, cell, frame, Consts.PieceScale.Storage);
            me._storage.push(piece);
        }

        me._booster = new Booster(scene, board.getBoosterPosition(playerIndex));

        scene.add.image(
            me._storagePosition.x + Consts.StorageSize.Width / 2, 
            me._storagePosition.y + Consts.StorageSize.Height / 2, 
            'storage')
            .setDepth(-100);
    }

    /**
     * @param {Number} value 
     * @returns {Object[]}
     */
    getAvailableSteps(value) {
        const me = this;

        const steps = [];

        const circleLength = me._board.getCircleLength();
        for (let i = 0; i < me._pieces.length; ++i) {
            const piece = me._pieces[i];

            const success = me._tryGetAvailableMovementStep(piece, value, steps, false);

            const needTryCycle = !success 
                                 && me._storage.length == 0 
                                 && me._pieces.filter(p => p.cell.index <= circleLength).length === 1
                                 && piece.cell.index < circleLength;
            if (needTryCycle)
                me._tryGetAvailableMovementStep(piece, value, steps, true);
        }

        const spawn = me._board.getSpawn(me._playerIndex);
        const canSpawn = value === Consts.DiceSpawnValue
                         && me._storage.length > 0
                         && Utils.all(me._pieces, p => !spawn.isEqualPos(p.cell));
        if (canSpawn) {
            const piece = me._storage[me._storage.length - 1];
            steps.push({ from: piece.cell, to: spawn });
        }

        return steps;       
    }

    hasPieceAt(target) {
        const me = this;

        return Utils.any(me._pieces, p => target.isEqualPos(p.cell));
    }

    /**
     * @param {Object} step
     * @param {Function} callback
     * @param {Object} context
     */
    makeStep(step, callback, context) {
        const me = this;

        const from = step.from;
        const to = step.to;

        const isSpawn = from.index === Consts.Undefined && to.index === 0;
        if (isSpawn) {
            const piece = me._storage[me._storage.length - 1];
            piece.move(to, Consts.PieceScale.Normal, () => me._onSpawn(piece, callback, context), me);
        } else {
            /** @type {Piece} */
            const piece = Utils.firstOrNull(me._pieces, p => p.cell.index === from.index);
            if (piece === null)
                throw `can't find piece on cell: ${from.index}`;

            piece.move(to, Consts.PieceScale.Normal, callback, context);    
        }
    }

    disableBooster() {
        const me = this;

        return me._booster.disable();
    }

    applyBooster(value) {
        const me = this;

        return me._booster.enable(value);
    }

    getBoosterValues() {
        const me = this;

        const endGame = me._getEndgame();

        return me._booster.toValues(endGame);
    }

    _getEndgame() {
        const me = this;

        if (me._storage.length > 0)
            return Consts.Undefined;

        const circleLength = me._board.getCircleLength();
        if (me._pieces.filter(p => p.cell.index < circleLength).length !== 1)
            return Consts.Undefined;

        /** @type {Piece} */
        const piece = Utils.firstOrNull(me._pieces, p => p.cell.index < circleLength);
        if (piece == null)
            throw `can't calculate endgame`;

        const endgame = circleLength - piece.cell.index;
        return endgame <= 6 ? endgame : Consts.Undefined;
    }

    _tryGetAvailableMovementStep(piece, value, steps, isCycle) {
        const me = this;

        const target = me._board.getCell(me._playerIndex, piece.cell.index + value, isCycle);

        const isAvailable = target.index != Consts.Undefined
                            && Utils.all(
                                me._pieces, 
                                (p) => !target.isEqualPos(p.cell));

        if (!isAvailable) 
            return false;

        steps.push({ from: piece.cell, to: target, isCycle: isCycle });
        return true;
    }

    _onSpawn(piece, callback, context) {
        const me = this;

        me._storage = me._storage.filter(p => p !== piece);
        me._pieces.push(piece);

        if (!!callback)
            callback.call(context);
    }

    /**
     * @param {Cell} target 
     */
    tryKill(target, callback, context) {
        const me = this;

        /** @type {Piece} */
        const piece = Utils.firstOrNull(
            me._pieces, 
            p => p.cell.row === target.row && p.cell.col === target.col);

        if (piece == null)
            return false;

        const position = me._getPositionInStorage();
        piece.move(
            position, 
            Consts.PieceScale.Storage,
            () => { me._onKill(piece, callback, context) }, 
            me);
        return true;
    }

    isStorageClick(point) {
        const me = this;

        const storageRect = new Phaser.Geom.Rectangle(
            me._storagePosition.x,
            me._storagePosition.y,
            Consts.StorageSize.Width,
            Consts.StorageSize.Height
        );

        return Phaser.Geom.Rectangle.ContainsPoint(storageRect, point);
    }

    isWinner() {
        const me = this;

        const circleLength = me._board.getCircleLength();
        return me._storage.length === 0
               && Utils.all(me._pieces, p => p.cell.index >= circleLength);
    }

    applyCycleBooster() {
        const me = this;

        me._booster.applyCycle();
    }

    _onKill(piece, callback, context) {
        const me = this;

        me._pieces = me._pieces.filter(p => p !== piece);
        me._storage.push(piece);
        me._booster.disable();
        me._booster.disableCycle();

        if (!!callback)
            callback.call(context);
    }

    _getPositionInStorage() {
        const me = this;

        const index = me._storage.length;
        return new Cell({
            player: me._playerIndex,
            x: me._storagePosition.x + Consts.StorageSize.Width - index * Consts.UnitSmall - 0.5 * Consts.UnitSmall,
            y: me._storagePosition.y + Consts.StorageSize.Height / 2
        });
    }
}