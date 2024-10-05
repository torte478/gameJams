import Phaser from "../lib/phaser.js";

import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";

import Config from "./Config.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";
import Grid from "./Grid.js";

export default class ChunkView {
  /** @type {Phaser.GameObjects.Image} */
  _grid;

  /** @type {Phaser.GameObjects.Image[]} */
  _cells;

  /** @type {Phaser.GameObjects.Container} */
  _container;

  constructor() {
    const me = this;

    me._grid = Here._.add.image(
      Consts.Sizes.Cell * 1.5,
      Consts.Sizes.Cell * 1.5,
      "grid"
    );

    me._cells = [];

    for (let i = 0; i < 3; ++i)
      for (let j = 0; j < 3; ++j)
        me._cells.push(
          Here._.add.image(
            j * Consts.Sizes.Cell + 0.5 * Consts.Sizes.Cell,
            i * Consts.Sizes.Cell + 0.5 * Consts.Sizes.Cell,
            "step",
            0
          )
        );

    const children = [];
    children.push(me._grid);
    for (let i = 0; i < me._cells.length; ++i) children.push(me._cells[i]);

    me._container = Here._.add.container(0, 0, children);
  }

  makeStep(cell, side) {
    const me = this;

    me._cells[cell].setFrame(me._getFrame(side));
  }

  setState(state) {
    const me = this;

    for (let i = 0; i < me._cells.length; ++i) {
      me._cells[i].setFrame(me._getFrame(state.cells[i]));
    }
  }

  _getFrame(side) {
    const me = this;

    if (side == Enums.Side.NONE) return 0;
    if (side == Enums.Side.CROSS) return 1;
    if (side == Enums.Side.NOUGHT) return 2;

    throw `wrong side ${side}`;
  }
}
