import Utils from "../framework/Utils.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";

export default class Chunk {
  static cellMap = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
  ];

  /** @type {Number[]} */
  _cells;

  _foo = -1;

  constructor() {
    const me = this;

    me._cells = Utils.buildArray(9, Enums.Side.NONE);
  }

  update(mousePos) {
    const me = this;

    me._foo = me._mouseToCell(mousePos);
  }

  _mouseToCell(mousePos) {
    const me = this;

    const x = Math.floor(mousePos.x / Consts.Sizes.Cell);
    const y = Math.floor(mousePos.y / Consts.Sizes.Cell);

    if (x < 0 || x > 2) return -1;
    if (y < 0 || y > 2) return -1;

    return Chunk.cellMap[y][x];
  }
}
