import Controls from "../framework/Controls.js";
import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Config from "./Config.js";
import Enums from "./Enums.js";

export default class Player {
  /** @type {Phaser.GameObjects.Container} */
  _container;

  constructor() {
    const me = this;

    const sprite = Here._.add.image(0, 0, "player");
    me._container = Here._.add.container(400, 300, sprite);
  }

  update(deltaSec) {
    const me = this;

    let dx = 0;
    let dy = 0;
    if (Here.Controls.isPressing(Enums.Keyboard.LEFT)) dx = -1;
    if (Here.Controls.isPressing(Enums.Keyboard.RIGHT)) dx = +1;
    if (Here.Controls.isPressing(Enums.Keyboard.UP)) dy = -1;
    if (Here.Controls.isPressing(Enums.Keyboard.DOWN)) dy = +1;

    if (dx === 0 && dy === 0) {
      return;
    }

    if (dx !== 0 && dy !== 0) {
      const normalizeFactor = Math.sqrt(2) / 2;
      dx *= normalizeFactor;
      dy *= normalizeFactor;
    }

    const oldPos = Utils.toPoint(me._container);
    me._container.setPosition(
      oldPos.x + dx * Config.Player.Speed * deltaSec,
      oldPos.y + dy * Config.Player.Speed * deltaSec
    );
  }
}
