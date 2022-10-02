import Phaser from '../../lib/phaser.js';

import Cell from './Cell.js';
import Config from '../Config.js';
import Consts from '../Consts.js';
import Enums from '../Enums.js';
import Status from '../Status.js';
import Utils from '../utils/Utils.js';

export default class Field {

    _scene;

    /** @type {Phaser.GameObjects.Container} */
    _container;

    /** @type {Phaser.Geom.Rectangle} */
    _bounds;

    /** @type {Cell[][]} */
    _cells;

    /** @type {Boolean} */
    _isGenerated;

    /** @type {Status} */
    _status;

    /** @type {Phaser.Tweens.Tween} */
    _alphaTween;

    /** @type {Boolean} */
    _isIncreaseAlpha;

    /** @type {Boolean} */
    lockAlpha;

    /** @type {Phaser.Events.EventEmitter} */
    emitter;

    /**
     * 
     * @param {Phaser.Scene} scene 
     * @param {Status} status
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} width 
     * @param {Number} height 
     */
    constructor(scene, status, x, y, width, height, reserve) {
        const me = this

        me._scene = scene;
        me._isIncreaseAlpha = true;
        me.lockAlpha = false;
        me._reserve = reserve;

        me._cells = [];
        for (let i = 0; i < height; ++i) {
            const row = [];
            for (let j = 0; j < width; ++j)
            {
                const index = i * width + j;
                const cell = new Cell(
                    scene,
                    index,
                    j * Consts.Unit, 
                    i * Consts.Unit,
                    false,
                    Enums.Cell.Unknown,
                    me._onCellClick,
                    me);
                row.push(cell);
            }
            me._cells.push(row);
        }

        const children = [];
        for (let i = 0; i < me._cells.length; ++i)
            for (let j = 0; j < me._cells[i].length; ++j)
                children.push(me._cells[i][j].toGameObject());

        me._container = scene.add.container(x, y, children)
            .setSize(width * Consts.Unit, height * Consts.Unit)
            .setDepth(Consts.Depth.Field);

        me._bounds = new Phaser.Geom.Rectangle(
            x - Consts.Unit,
            y - Consts.Unit,
            me._container.getBounds().width + 2 * Consts.Unit,
            me._container.getBounds().height + 2 * Consts.Unit);

        me._isGenerated = false;
        me._status = status;
        me.emitter = new Phaser.Events.EventEmitter();

        me._container
            .setAlpha(Consts.FieldAlpha.Min)
            .setDepth(Consts.Depth.FieldBackground);
    }

    /** @type {Phaser.Geom.Point} */
    update(pointer) {
        const me = this;

        if (me.lockAlpha)
            return;

        const inside = Phaser.Geom.Rectangle.ContainsPoint(
            me._bounds,
            pointer);

        if (inside)
            me._increaseAlpha(false);
        else
            me._decreaseAlpha(false);
    }

    increaseAlpha() {
        const me = this;

        me._increaseAlpha(true);
    }

    decreaseAlpha() {
        const me = this;

        me._decreaseAlpha(true);
    }

    /**
     * @param {Number} index 
     * @returns {Phaser.Geom.Point}
     */
    toPosition(index) {
        const me = this;

        const cell = Utils.toMatrixIndex(me._cells, index);
        return Utils.buildPoint(
            me._container.x + cell.j * Consts.Unit,
            me._container.y + cell.i * Consts.Unit - Consts.UnitSmall)
    }

    /**
     * @param {Number} index
     * @returns {Boolean}
     */
    canExplode(index) {
        const me = this;

        const cell = Utils.toMatrixIndex(me._cells, index);
        return me._cells[cell.i][cell.j].canExplode();
    }

    /**
     * @param {Number} index 
     */
    openCell(index) {
        const me = this;

        const cell = Utils.toMatrixIndex(me._cells, index);
        return me._cells[cell.i][cell.j].open();
    }

    isOpen(index) {
        const me = this;

        const cell = Utils.toMatrixIndex(me._cells, index);
        return me._cells[cell.i][cell.j].isOpen();
    }

    /**
     * @param {Number} index 
     */
    explode(index) {
        const me = this;

        const cell = Utils.toMatrixIndex(me._cells, index);
        me._cells[cell.i][cell.j].explode();
    }

    /**
     * @param {Number} targetIndex 
     * @param {Number[]} soldierPositions 
     * @returns {Object}
     */
    isReached(targetIndex, soldierPositions) {
        const me = this;

        const bfs = me._getReachedSoldiers(targetIndex, soldierPositions)

        return bfs.soldiers.length > 0;
    }

    /**
     * @param {Number} targetIndex 
     * @param {Number[]} soldierPositions 
     * @returns {Object}
     */
    findPath(targetIndex, soldierPositions) {
        const me = this;

        const bfs = me._getReachedSoldiers(targetIndex, soldierPositions)
        const target = bfs.target;
        const soldiers = bfs.soldiers;
        const matrix = bfs.matrix;

        if (soldiers.length == 0)
            return null;

        let minIndex = 0;
        let minDist = matrix[soldiers[0].i][soldiers[0].j].dist;

        for (let i = 1; i < soldiers.length; ++i) { 
            const curDist = matrix[soldiers[i].i][soldiers[i].j].dist;
            if (curDist < minDist) {
                minDist = curDist;
                minIndex = i
            };
        }

        const start = soldiers[minIndex];
        const soldierIndex = Utils.fromMatrix(matrix, start.i, start.j);
        const cells = [];

        let currentPathCell = start;
        let expectedDist = matrix[start.i][start.j].dist - 1;
        do {

            const nextCells = Utils
                .getNeighbours(matrix, currentPathCell.i, currentPathCell.j)
                .filter(n => matrix[n.i][n.j].dist == expectedDist);

            const nextCell = Utils.getRandomEl(nextCells);

            const nextCellIndex = Utils.fromMatrix(matrix, nextCell.i, nextCell.j);
            cells.push(me.toPosition(nextCellIndex));
            expectedDist -= 1;
            currentPathCell = nextCell;

        } 
        while (currentPathCell.i != target.i || currentPathCell.j != target.j);

        return {
            soldierIndex: soldierIndex,
            cells: cells,
        };
    }

    changeFlag(index) {
        const me = this;

        const cell = Utils.toMatrixIndex(me._cells, index);

        me._cells[cell.i][cell.j].changeFlag();
    }

    getFlagCount() {
        const me = this;

        let totalFlags = 0;
        for (let i = 0; i < me._cells.length; ++i)
            for (let j = 0; j < me._cells.length; ++j)
                if (me._cells[i][j].isFlag)
                    ++totalFlags;

        return totalFlags;
    }

    isWin() {
        const me = this;

        let closed = 0;
        for (let i = 0; i < me._cells.length; ++i)
            for (let j = 0; j < me._cells[i].length; ++j)
                if (!me._cells[i][j].isOpen())
                    ++closed;

        let mines = 0;
        for (let i = 0; i < me._cells.length; ++i)
            for (let j = 0; j < me._cells[i].length; ++j)
                if (me._cells[i][j].canExplode())
                    ++mines;

        return closed == mines;
    }

    _getReachedSoldiers(targetIndex, soldierPositions) {
        const me = this;

        const matrix = [];
        for (let i = 0; i < me._cells.length; ++i) {
            const row = [];
            for (let j = 0; j < me._cells[i].length; ++j)
                row.push({
                    dist: 9999999999,
                    visited: false
                });

            matrix.push(row);
        }

        const target = Utils.toMatrixIndex(me._cells, targetIndex);
        let toVisit = [ target ];
        matrix[target.i][target.j].dist = 0;
        matrix[target.i][target.j].visited = true;

        while (toVisit.length > 0) {
            const nextToVisit = [];

            for (let k = 0; k < toVisit.length; ++k) {
                const current = toVisit[k];
                const neighbours = Utils
                    .getNeighbours(me._cells, current.i, current.j)
                    .filter(n => matrix[n.i][n.j].visited == false
                                 && me._cells[n.i][n.j].isOpen());

                for (let l = 0; l < neighbours.length; ++l) {
                    const cell = neighbours[l];
                    matrix[cell.i][cell.j].dist = matrix[current.i][current.j].dist + 1;
                    matrix[cell.i][cell.j].visited = true;
                    nextToVisit.push(cell);
                }
            }

            toVisit = nextToVisit;
        }

        const soldiers = soldierPositions
            .map(s => Utils.toMatrixIndex(matrix, s))
            .filter(s => matrix[s.i][s.j].visited);

        return {
            target: target,
            soldiers: soldiers,
            matrix: matrix
        };
    }

    _onCellClick(index, button) {
        const me = this;

        if (me._status.isBusy)
            return;

        if (!me._isGenerated && button == 0 && me._reserve.getSoilderCount() > 0)
            me._generate();
            
        me._makeStep(index, button);
    }

    _makeStep(index, button) {
        const me = this;

        me.emitter.emit('cellClick', index, button);
    }

    _generate() {
        const me = this;

        const mines = me._getMines();

        for (let i = 0; i < mines.length; ++i)
            if (mines[i]) {
                /** @type {Cell} */
                const cur = Utils.toMatrixIndex(me._cells, i);
                me._cells[cur.i][cur.j].setMine();
            }

        for (let i = 0; i < mines.length; ++i)
            if (!mines[i]) {
                const cur = Utils.toMatrixIndex(me._cells, i);

                const content = Utils
                    .getNeighbours(me._cells, cur.i, cur.j)
                    .filter(c => me._cells[c.i][c.j].canExplode())
                    .length;

                me._cells[cur.i][cur.j].setContent(content);

                Utils.ifDebug(Config.Debug.Mines, () => {
                    if (Config.DebugMines[cur.i][cur.j] == 2)
                        me._cells[cur.i][cur.j].open();
                });
            }

        me._isGenerated = true;
    }

    _getMines() {
        const me = this;

        if (Utils.isDebug(Config.Debug.Mines)) {
            const mines = [];
            for (let i = 0; i < Config.DebugMines.length; ++i)
                for (let j = 0; j < Config.DebugMines[i].length; ++j)
                    mines.push(Config.DebugMines[i][j] == 1);

            return mines;
        }

        const mines = Utils.buildArray(me._cells.length * me._cells[0].length, false);
        for (let i = 0; i < Config.Levels[me._status.level].Mines; ++i)
            mines[i] = true;

        return Utils.shuffle(mines);
    }

    _increaseAlpha(force) {
        const me = this;

        const needStartTween = (!me._isIncreaseAlpha || !me._alphaTween || force) 
                               && Math.abs(me._container.alpha - Consts.FieldAlpha.Max) > Consts.Eps;

        if (!needStartTween)
            return;

        if (force)
            me.lockAlpha = true;

        if (!!me._alphaTween)
            me._alphaTween.stop();

        me._isIncreaseAlpha = true;
        me._container.setDepth(Consts.Depth.Field);

        const percentage = 1 - (me._container.alpha - Consts.FieldAlpha.Min) / (Consts.FieldAlpha.Max - Consts.FieldAlpha.Min);
        const duration = Consts.FieldAlpha.DurationInc * percentage;

        me._alphaTween = me._scene.add.tween({
            targets: me._container,
            alpha: { from: me._container.alpha, to: Consts.FieldAlpha.Max},
            duration: duration,
            ease: 'Sine.easeInOut',
            onComplete: () => { 
                me._alphaTween = null;
                me._container.setAlpha(Consts.FieldAlpha.Max);
            }
        });
    }

    _decreaseAlpha(force) {
        const me = this;

        const needStartTween = force 
                               || ((me._isIncreaseAlpha || !me._alphaTween) 
                                    && Math.abs(me._container.alpha - Consts.FieldAlpha.Min) > Consts.Eps);

        if (!needStartTween)
            return;

        if (force)
            me.lockAlpha = true;

        if (!!me._alphaTween)
            me._alphaTween.stop();

        me._isIncreaseAlpha = false;

        const percentage = (me._container.alpha - Consts.FieldAlpha.Min) / (Consts.FieldAlpha.Max - Consts.FieldAlpha.Min);
        const duration = (force ? Consts.FieldAlpha.DurationDecForce : Consts.FieldAlpha.DurationDec) * percentage;

        me._alphaTween = me._scene.add.tween({
            targets: me._container,
            alpha: { from: me._container.alpha, to: Consts.FieldAlpha.Min},
            duration: duration,
            ease: 'Sine.easeInOut',
            onComplete: () => { 
                me._alphaTween = null;
                me._container
                    .setAlpha(Consts.FieldAlpha.Min)
                    .setDepth(Consts.Depth.FieldBackground);
            }
        });
    }
}