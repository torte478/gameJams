import phaser from '../lib/phaser.js';
import Phaser from '../lib/phaser.js';

import Cell from './Cell.js';
import Consts from './Consts.js';
import Enums from './Enums.js';

export default class Field {

    /** @type {Phaser.GameObjects.Container} */
    _container;

    /** @type {Cell[][]} */
    _cells;

    /**
     * 
     * @param {Phaser.Scene} scene 
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} width 
     * @param {Number} height 
     */
    constructor(scene, x, y, width, height) {
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
    }

    /** @type {Phaser.Geom.Point} */
    update(pointer) {
        const me = this;

        const inside = Phaser.Geom.Rectangle.ContainsPoint(
            me._container.getBounds(),
            pointer);

        me._container.setAlpha(inside ? 1 : 0.05);
    }

    _onCellClick(index) {
        const me = this;

        console.log(`${index} click`);
    }
}