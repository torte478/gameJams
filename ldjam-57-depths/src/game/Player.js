import Controls from "../framework/Controls.js";
import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Config from "./Config.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";

export default class Player {
  /** @type {Phaser.GameObjects.Container} */
  _container;

  /** @type {Number} */
  _garbageCount = 0;

  constructor() {
    const me = this;

    const sprite = Here._.add.image(0, 0, "player");
    me._container = Here._.add
      .container(400, 300, sprite)
      .setSize(Consts.Unit.Normal, Consts.Unit.Normal);

    Here._.physics.world.enable(me._container);
    me._container.body.setBounce(1, 1);
  }

  update(deltaSec) {
    const me = this;

    const body = me._container.body;
    let dx = 0;
    let dy = 0;
    if (Here.Controls.isPressing(Enums.Keyboard.LEFT)) dx = -1;
    if (Here.Controls.isPressing(Enums.Keyboard.RIGHT)) dx = +1;
    if (Here.Controls.isPressing(Enums.Keyboard.UP)) dy = -1;
    if (Here.Controls.isPressing(Enums.Keyboard.DOWN)) dy = +1;

    if (dx === 0 && dy === 0) {
      body.setVelocity(0, 0);
      return;
    }

    if (dx !== 0 && dy !== 0) {
      const normalizeFactor = Math.sqrt(2) / 2;
      dx *= normalizeFactor;
      dy *= normalizeFactor;
    }

    body.setVelocity(dx * Config.Player.Speed, dy * Config.Player.Speed);
  }

  toGameObject() {
    const me = this;

    return me._container;
  }

  addGarbage() {
    const me = this;

    me._garbageCount += 1;
    if (me._garbageCount < Config.Player.MaxGarbageCountAtBag) {
      return false;
    }

    me._garbageCount = 0;
    return true;
  }
}
