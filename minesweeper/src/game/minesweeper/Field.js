import Phaser from '../../lib/phaser.js';

import Cell from './Cell.js';
import Config from '../Config.js';
import Consts from '../Consts.js';
import Enums from '../Enums.js';
import Status from '../Status.js';
import Utils from '../utils/Utils.js';

export default class Field {

    /** @type {Phaser.GameObjects.Container} */
    _container;

    /** @type {Cell[][]} */
    _cells;

    /** @type {Boolean} */
    _isGenerated;

    /** @type {Status} */
    _status;

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
    constructor(scene, status, x, y, width, height) {
        const me = this

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
            .setSize(width * Consts.Unit, height * Consts.Unit);

        me._isGenerated = false;
        me._status = status;
        me.emitter = new Phaser.Events.EventEmitter();
    }

    /** @type {Phaser.Geom.Point} */
    update(pointer) {
        const me = this;

        const inside = Phaser.Geom.Rectangle.ContainsPoint(
            me._container.getBounds(),
            pointer);

        me._container.setAlpha(inside ? 1 : 0.05);
    }

    /**
     * @param {Number} index 
     * @returns {Phaser.Geom.Point}
     */
    toPosition(index) {
        const me = this;

        const cell = Utils.toMatrixIndex(me._cells, index);
        return Utils.buildPoint(
            me._container.x + cell.j * Consts.Unit + Consts.Unit / 2,
            me._container.y + cell.i * Consts.Unit + Consts.Unit / 2)
    }

    _onCellClick(index) {
        const me = this;

        if (!me._isGenerated)
            me._generate();
            
        me._makeStep(index);
    }

    _makeStep(index) {
        const me = this;

        me._status.busy();
        me.emitter.emit('cellClick', index);
    }

    _generate() {
        const me = this;

        let mines = Utils.buildArray(me._cells.length * me._cells[0].length, false);
        for (let i = 0; i < Config.Levels[me._status.level].Mines; ++i)
            mines[i] = true;
        mines = Utils.shuffle(mines);

        for (let i = 0; i < mines.length; ++i)
            if (mines[i]) {
                /** @type {Cell} */
                const cur = Utils.toMatrixIndex(me._cells, i);
                me._cells[cur.i][cur.j].isMine = true;
            }

        for (let i = 0; i < mines.length; ++i)
            if (!mines[i]) {
                const cur = Utils.toMatrixIndex(me._cells, i);

                const content = Utils
                    .getNeighbours(me._cells, cur.i, cur.j)
                    .filter(c => me._cells[c.i][c.j].isMine)
                    .length;

                me._cells[cur.i][cur.j].setContent(content);
            }

        me._isGenerated = true;
    }
}