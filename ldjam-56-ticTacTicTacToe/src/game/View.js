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

  changeState(state) {
    const me = this;

    const duration = 1500;

    Here._.add.tween({
      targets: me._first.container,
      // x: 1.5 * Consts.Sizes.Cell,
      // y: 1.5 * Consts.Sizes.Cell - 75,
      scale: { from: 1, to: 0.25 },
      alpha: { from: 1, to: 0 },
      duration: duration,
      ease: "Sine.easeInOut",
    });

    me._second.setState(state);
    Here._.add.tween({
      targets: me._second.container,
      // x: 1.5 * Consts.Sizes.Cell - 75,
      // y: 1.5 * Consts.Sizes.Cell - 75,
      scale: { from: 2, to: 1 },
      alpha: { from: 0, to: 1 },
      duration: duration,
      ease: "Sine.easeInOut",
    });
  }
}
