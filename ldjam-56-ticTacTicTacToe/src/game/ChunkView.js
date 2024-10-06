import Phaser from "../lib/phaser.js";

import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";

import Config from "./Config.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";
import Grid from "./Grid.js";
import ColorConfig from "./ColorConfig.js";

export default class ChunkView {
  /** @type {Phaser.GameObjects.Image} */
  _grid;

  /** @type {Phaser.GameObjects.Image[]} */
  _cells;

  /** @type {Phaser.GameObjects.Container} */
  container;

  /** @type {ColorConfig} */
  _color;

  /**
   * @param {ColorConfig} colorConfig
   */
  constructor(colorConfig) {
    const me = this;

    me._grid = Here._.add.image(0, 0, "grid").setTintFill(colorConfig.main);
    me._color = colorConfig;

    me._cells = [];

    for (let i = -1; i < 2; ++i)
      for (let j = -1; j < 2; ++j)
        me._cells.push(
          Here._.add
            .image(j * Consts.Sizes.Cell, i * Consts.Sizes.Cell, "step", 0)
            .setTintFill(colorConfig.main)
        );

    const children = [];
    children.push(me._grid);
    for (let i = 0; i < me._cells.length; ++i) children.push(me._cells[i]);

    me.container = Here._.add.container(
      Consts.Sizes.Cell * 1.5,
      Consts.Sizes.Cell * 1.5,
      children
    );
  }

  makeStep(cell, side) {
    const me = this;

    const current = me._cells[cell];
    current
      .setFrame(me._getFrame(side))
      .setTintFill(!!current.isWinner ? me._color.selection : me._color.main);
  }

  setState(state) {
    const me = this;

    for (let i = 0; i < me._cells.length; ++i) {
      me._cells[i].setFrame(me._getFrame(state.cells[i]));
      me._cells[i].isWinner = !!state.winRow && Utils.contains(state.winRow, i);
      const color = me._cells[i].isWinner
        ? me._color.selection
        : me._color.main;
      me._cells[i].setTintFill(color);
    }
  }

  /**
   * @param {ColorConfig} fromColor
   * @param {ColorConfig} toColor
   * @param {Number} duration
   */
  updateColor(fromColor, toColor, duration) {
    const me = this;

    me._color = toColor;
    Utils.UpdateColor(me._grid, duration, fromColor.main, toColor.main);
    for (let i = 0; i < me._cells.length; ++i) {
      const isWinner = !!me._cells[i].isWinner;
      Utils.UpdateColor(
        me._cells[i],
        duration,
        isWinner ? fromColor.selection : fromColor.main,
        isWinner ? toColor.selection : toColor.main
      );
    }
  }

  _getFrame(side) {
    const me = this;

    if (side == Enums.Side.NONE) return 0;
    if (side == Enums.Side.CROSS) return 1;
    if (side == Enums.Side.NOUGHT) return 2;
    if (side == Enums.Side.DRAW) return 3;

    throw `wrong side ${side}`;
  }
}
