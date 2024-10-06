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
  layer;

  /** @type {Array}} */
  stepHistory;

  /** @type {Number} */
  winner;

  /** @type {Chunk | null} */
  parent;

  /** @type {Number[]} */
  _winRow;

  constructor(layer) {
    const me = this;

    me.layer = layer;
    me._cells = Utils.buildArray(9, Enums.Side.NONE);
    me.stepHistory = [];
    me.winner = Enums.Side.NONE;
    me.parent = null;
  }

  /**
   * @param {Number} cell
   * @param {Number} step
   */
  makeStep(cell, step) {
    const me = this;

    if (me.winner != Enums.Side.NONE) throw "chunk is complete";

    me._cells[cell] = step;

    me.stepHistory.push({ cell: cell, side: step });

    const winResult = Grid.getWinner(me.getState().cells);
    me.winner = winResult.winner;
    me._winRow = winResult.row;
    return me.winner;
  }

  setParent(chunk) {
    const me = this;
    if (!!me.parent) throw "parent already initialized";

    me.parent = chunk;
  }

  getRoot() {
    const me = this;

    let root = this;
    while (!!root.parent) root = me.parent;

    return root;
  }

  /**
   * @param {Number} cellIndex
   * @returns {Number | Chunk}
   */
  getCell(cellIndex) {
    const me = this;

    if (cellIndex < 0 || cellIndex >= 9) throw `wrong cell ${cellIndex}`;

    const cell = me._cells[cellIndex];
    if (me.layer > 0 && !cell) {
      const child = new Chunk(me.layer - 1);
      child.setParent(this);
      me._cells[cellIndex] = child;
    }
    return me._cells[cellIndex];
  }

  /**
   * @param {Number} cellIndex
   * @returns {Boolean}
   */
  isFree(cellIndex) {
    const me = this;

    const cell = me.getCell(cellIndex);
    return cell == Enums.Side.NONE || cell.winner == Enums.Side.NONE;
  }

  /**
   * @returns {Number[]}
   */
  getAvailableSteps() {
    const me = this;

    const result = [];
    for (let i = 0; i < me._cells.length; ++i) if (me.isFree(i)) result.push(i);

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
        me.layer == 0 || !me._cells[i] ? me._cells[i] : me._cells[i].winner;
      cells.push(side);
    }
    return {
      cells: cells,
      winRow: me._winRow,
    };
  }

  getChildState(cell) {
    const me = this;

    if (me.layer == 0) throw "can't have child";

    const child = me._cells[cell];
    if (!!child) return child.getState();

    return {
      cells: Utils.buildArray(9, Enums.Side.NONE),
    };
  }

  recalculateWinner() {
    const me = this;

    const winResult = Grid.getWinner(me.getState().cells);
    me.winner = winResult.winner;
    me._winRow = winResult.row;
    return me.winner;
  }

  canMakeStep(cell) {
    const me = this;

    if (me.layer > 0) return false;

    if (!me.isFree(cell)) return false;

    let chunk = this;
    while (!!chunk) {
      if (chunk.winner != Enums.Side.NONE) return false;

      chunk = chunk.parent;
    }

    return true;
  }
}
