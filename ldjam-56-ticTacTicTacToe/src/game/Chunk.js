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

  constructor(stepPool) {
    const me = this;

    me._cells = Utils.buildArray(9, Enums.Side.NONE);
    me._images = Utils.buildArray(9, null);
    me._stepPool = stepPool;
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
  }
}
