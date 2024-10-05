import Phaser from "../lib/phaser.js";

import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";

import Config from "./Config.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";
import Grid from "./Grid.js";

export default class Chunk {
  /** @type {Number[]} */
  _cells;

  /** @type {Phaser.GameObjects.Image[]} */
  _images;

  /** @type {Phaser.GameObjects.Group} */
  _stepPool;

  /** @type {Array}} */
  stepHistory;

  constructor(stepPool) {
    const me = this;

    me._cells = Utils.buildArray(9, Enums.Side.NONE);
    me._images = Utils.buildArray(9, null);
    me._stepPool = stepPool;
    me.stepHistory = [];
  }

  /**
   * @param {Number} cell
   * @returns {Number}
   */
  getCell(cell) {
    const me = this;

    if (cell < 0 || cell >= 9) throw `wrong cell ${cell}`;

    return me._cells[cell];
  }

  /**
   * @param {Number} cell
   * @returns {Boolean}
   */
  isFree(cell) {
    const me = this;

    return me.getCell(cell) == Enums.Side.NONE;
  }

  /**
   * @param {Number} cell
   * @param {Number} side
   */
  makeStep(cell, side) {
    const me = this;

    me._cells[cell] = side;

    const pos = Grid.cellToPos(cell);
    me._images[cell] = me._stepPool.create(
      pos.x,
      pos.y,
      "step",
      side == Enums.Side.CROSS ? 0 : 1
    );

    me.stepHistory.push({ cell: cell, side: side });
  }

  /**
   * @returns {Number[]}
   */
  getAvailableSteps() {
    const me = this;
    const result = [];
    for (let i = 0; i < me._cells.length; ++i)
      if (me._cells[i] == Enums.Side.NONE) result.push(i);
    return result;
  }

  toAssumption(cell, side) {
    const me = this;

    const assumption = Utils.copyArray(me._cells);
    assumption[cell] = side;
    return assumption;
  }

  filterFree(cells) {
    const me = this;
    const res = [];
    for (let i = 0; i < cells.length; ++i)
      if (me.isFree(cells[i])) res.push(cells[i]);
    return res;
  }
}
