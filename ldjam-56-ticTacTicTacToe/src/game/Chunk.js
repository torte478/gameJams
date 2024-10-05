import Phaser from "../lib/phaser.js";

import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";

import Config from "./Config.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";
import Grid from "./Grid.js";

export default class Chunk {
  /** @type {Number[] | Chunk[]} } */
  _cells;

  /** @type {Number} */
  _layer;

  /** @type {Array}} */
  stepHistory;

  /** @type {Number} */
  winner;

  /** @type {Chunk | null} */
  parent;

  constructor(layer) {
    const me = this;

    me._layer = layer;
    me._cells = Utils.buildArray(9, Enums.Side.NONE);
    me.stepHistory = [];
    me.winner = Enums.Side.NONE;
    me.parent = null;
  }

  /**
   * @param {Number} cell
   * @param {Number} side
   */
  makeStep(cell, side) {
    const me = this;

    if (me.winner != Enums.Side.NONE) throw "chunk is complete";

    me._cells[cell] = side;

    me.stepHistory.push({ cell: cell, side: side });

    me.winner = Grid.getWinner(me._cells);
    return me.winner;
  }

  setParent(chunk) {
    const me = this;
    if (!!me.parent) throw "parent already initialized";

    me.parent = chunk;
  }

  setChunk(cell, chunk) {
    const me = this;
    if (me._layer == 0 || !!me._cells[cell]) throw "chunk alredy initialized";

    me._cells[cell] = chunk;
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

  getState() {
    const me = this;

    const cells = [];
    for (let i = 0; i < me._cells.length; ++i) {
      const side =
        me._layer == 0 || !me._cells[i] ? me._cells[i] : me._cells[i].winner;
      cells.push(side);
    }
    return {
      cells: cells,
    };
  }
}
