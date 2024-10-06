import Phaser from "../lib/phaser.js";

import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";

import Config from "./Config.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";
import Grid from "./Grid.js";
import ChunkView from "./ChunkView.js";
import Chunk from "./Chunk.js";
import ColorConfig from "./ColorConfig.js";

export default class View {
  /** @type {ChunkView} */
  _first;

  /** @type {ChunkView} */
  _second;

  /** @type {ChunkView[]} */
  _cells;

  /** @type {Phaser.GameObjects.Image} */
  _background;

  /**
   * @param {ColorConfig} colorConfig
   */
  constructor(colorConfig) {
    const me = this;

    me._background = Here._.add
      .image(1.5 * Consts.Sizes.Cell, 1.5 * Consts.Sizes.Cell, "background")
      .setDepth(Consts.Depth.Background)
      .setTintFill(colorConfig.background);

    me._first = new ChunkView(colorConfig);
    me._second = new ChunkView(colorConfig);
    me._second.container.setAlpha(0);

    me._cells = [];
    for (let i = 0; i < 9; ++i) {
      const chunk = new ChunkView(colorConfig);
      const pos = Grid.cellToPos(i);
      chunk.container
        .setAlpha(0)
        .setScale(Config.Scale.Small)
        .setPosition(pos.x, pos.y);

      me._cells.push(chunk);
    }
  }

  makeStep(cell, side) {
    const me = this;

    me._first.makeStep(cell, side);
  }

  /**
   * @param {Chunk} chunk
   * @param {Function} callback
   * @param {Object} scope
   */
  goToUp(chunk, cell, callback, scope) {
    const me = this;

    me._hideChildren();

    const target = Grid.cellToPos(cell);
    const opposite = Grid.cellToPos(Grid.toOpposite(cell));
    const center = Grid.getCenterPos();
    const duration = Config.Duration.Layer;

    const fromColor = Config.Colors[chunk.layer - 1];
    const toColor = Config.Colors[chunk.layer];

    me._updateColors(fromColor, toColor, duration);

    Here._.add.tween({
      targets: me._first.container,
      x: { from: center.x, to: target.x },
      y: { from: center.y, to: target.y },
      scale: { from: Config.Scale.Normal, to: Config.Scale.Small },
      alpha: { from: 1, to: 0 },
      duration: duration,
    });

    me._second.setState(chunk.getState());
    Here._.add.tween({
      targets: me._second.container,
      x: {
        from: center.x + (opposite.x - center.x) * Config.Scale.Big,
        to: center.x,
      },
      y: {
        from: center.y + (opposite.y - center.y) * Config.Scale.Big,
        to: center.y,
      },
      scale: { from: Config.Scale.Big, to: Config.Scale.Normal },
      alpha: { from: 0, to: 1 },
      duration: duration,
      onComplete: () => {
        me._swap();
        Utils.callCallback(callback, scope);
      },
    });
  }

  /**
   * @param {Chunk} chunk
   * @param {Number} cell
   * @param {Function} callback
   * @param {Object} scope
   */
  goToDown(chunk, cell, callback, scope) {
    const me = this;

    me._hideChildren();

    const target = Grid.cellToPos(cell);
    const opposite = Grid.cellToPos(Grid.toOpposite(cell));
    const duration = Config.Duration.Layer;
    const center = Grid.getCenterPos();

    const fromColor = Config.Colors[chunk.layer + 1];
    const toColor = Config.Colors[chunk.layer];

    me._updateColors(fromColor, toColor, duration);

    Here._.add.tween({
      targets: me._first.container,
      x: {
        from: center.x,
        to: center.x + (opposite.x - center.x) * Config.Scale.Big,
      },
      y: {
        from: center.y,
        to: center.y + (opposite.y - center.y) * Config.Scale.Big,
      },
      scale: { from: Config.Scale.Normal, to: Config.Scale.Big },
      alpha: { from: 1, to: 0 },
      duration: duration,
    });

    me._second.setState(chunk.getState());
    Here._.add.tween({
      targets: me._second.container,
      x: {
        from: target.x,
        to: center.x,
      },
      y: {
        from: target.y,
        to: center.y,
      },
      scale: { from: Config.Scale.Small, to: Config.Scale.Normal },
      alpha: { from: 0.5, to: 1 },
      duration: duration,
      onComplete: () => {
        me._swap();
        Utils.callCallback(callback, scope);
      },
    });
  }

  /**
   * @param {Chunk} chunk
   */
  resetChildView(chunk) {
    const me = this;

    for (let i = 0; i < me._cells.length; ++i) {
      const child = chunk.getCell(i);
      me._cells[i].setState(child.getState());
      me._first.makeStep(i, child.winner);

      const alpha = child.winner == Enums.Side.NONE ? 0.5 : 0;
      me._cells[i].container.setAlpha(alpha);
    }
  }

  showPhantom(chunk, cell) {
    const me = this;

    me.resetChildView(chunk);
    me._first.makeStep(cell, Enums.Side.NONE);
    me._cells[cell].setState(chunk.getCell(cell).getState());
    me._cells[cell].container.setAlpha(1);
  }

  _updateColors(from, to, duration) {
    const me = this;

    Utils.UpdateColor(me._background, duration, from.background, to.background);

    me._first.updateColor(from, to, duration);
    me._second.updateColor(from, to, duration);
    for (let i = 0; i < me._cells.length; ++i)
      me._cells[i].updateColor(from, to, duration);
  }

  _hideChildren() {
    const me = this;

    for (let i = 0; i < me._cells.length; ++i) {
      me._cells[i].container.setAlpha(0);
    }
  }

  _swap() {
    const me = this;
    let t = me._first;
    me._first = me._second;
    me._second = t;
  }
}
