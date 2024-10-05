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
  goToUp(nextState, callback, scope) {
    const me = this;

    Here._.add.tween({
      targets: me._first.container,
      scale: { from: 1, to: 0.25 },
      alpha: { from: 1, to: 0 },
      duration: Config.Duration.LayerChange,
      ease: "Sine.easeInOut",
    });

    me._second.setState(nextState);
    Here._.add.tween({
      targets: me._second.container,
      scale: { from: 2, to: 1 },
      alpha: { from: 0, to: 1 },
      duration: Config.Duration.LayerChange,
      ease: "Sine.easeInOut",
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
    const me = this;

    const pos = Grid.cellToPos(cell);

    Here._.add.tween({
      targets: me._first.container,
      scale: { from: 1, to: 2 },
      alpha: { from: 1, to: 0 },
      duration: Config.Duration.LayerChange,
      ease: "Sine.easeInOut",
    });

    me._second.setState(nextState);
    Here._.add.tween({
      targets: me._second.container,
      scale: { from: 0.25, to: 1 },
      alpha: { from: 0, to: 1 },
      duration: Config.Duration.LayerChange,
      ease: "Sine.easeInOut",
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
    me._second.container.setPosition(pos.x, pos.y).setAlpha(0.5);
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
