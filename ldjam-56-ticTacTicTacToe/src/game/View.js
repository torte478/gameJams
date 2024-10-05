import Phaser from "../lib/phaser.js";

import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";

import Config from "./Config.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";
import Grid from "./Grid.js";
import ChunkView from "./ChunkView.js";

export default class View {
  /** @type {ChunkView} */
  _first;

  /** @type {ChunkView} */
  _second;

  constructor() {
    const me = this;

    me._first = new ChunkView();
    me._second = new ChunkView();
    me._second.container.setAlpha(0);
  }

  makeStep(cell, side) {
    const me = this;

    me._first.makeStep(cell, side);
  }

  /**
   * @param {Object} nextState
   * @param {Function} callback
   * @param {Object} scope
   */
  goToUp(nextState, cell, callback, scope) {
    const me = this;

    const target = Grid.cellToPos(cell);
    const center = Grid.getCenterPos();

    Here._.add.tween({
      targets: me._first.container,
      x: { from: center.x, to: target.x },
      y: { from: center.y, to: target.y },
      scale: { from: Config.Scale.Normal, to: Config.Scale.Small },
      alpha: { from: 1, to: 0 },
      duration: Config.Duration.LayerChange,
    });

    me._second.setState(nextState);
    Here._.add.tween({
      targets: me._second.container,
      x: center.x,
      y: center.y,
      scale: { from: Config.Scale.Big, to: Config.Scale.Normal },
      alpha: { from: 0, to: 1 },
      duration: Config.Duration.LayerChange,
      onComplete: () => {
        me._swap();
        Utils.callCallback(callback, scope);
      },
    });
  }

  /**
   * @param {Object} nextState
   * @param {Number} cell
   * @param {Function} callback
   * @param {Object} scope
   */
  goToDown(nextState, cell, callback, scope) {
    const me = this,
      cellSize = Consts.Sizes.Cell;

    const target = Grid.cellToPos(cell);
    const opposite = Grid.cellToPos(Grid.toOpposite(cell));
    const duration = Config.Duration.LayerChange;
    const center = Grid.getCenterPos();

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

    me._second.setState(nextState);
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

  showPhantom(cell, state, childState) {
    const me = this;

    me._first.setState(state);
    me._first.makeStep(cell, Enums.Side.NONE);

    me._second.setState(childState);
    const pos = Grid.cellToPos(cell);
    me._second.container
      .setPosition(pos.x, pos.y)
      .setAlpha(0.5)
      .setScale(Config.Scale.Small);
  }

  hidePhantom(state) {
    const me = this;

    me._second.container.setAlpha(0);
    me._first.setState(state);
  }

  _swap() {
    const me = this;
    const t = me._first;
    me._first = me._second;
    me._second = t;
  }
}
