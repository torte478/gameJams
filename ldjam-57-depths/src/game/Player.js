import Controls from "../framework/Controls.js";
import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Config from "./Config.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";

export default class Player {
  /** @type {Phaser.GameObjects.Container} */
  _container;

  /** @type {Phaser.GameObjects.Sprite} */
  _hand;

  /** @type {Number} */
  _garbageCount = 0;

  constructor() {
    const me = this;

    const sprite = Here._.add.image(0, 0, "player");
    me._hand = Here._.add.sprite(50, 0, "items", 6).setDepth(Consts.Depth.UI);

    me._container = Here._.add
      .container(400, 300, [sprite, me._hand])
      .setSize(Consts.Unit.Normal, Consts.Unit.Normal);

    Here._.physics.world.enable(me._container);
    /** @type {Phaser.Physics.Arcade.Body} */
    const body = me._container.body;

    body.setBounce(1, 1).setCircle(25);

    Here._.input.on("pointermove", me._onPointerMove, me);
  }

  update(deltaSec) {
    const me = this;

    me._updateMovement();
  }

  toGameObject() {
    const me = this;

    return me._container;
  }

  toMousePos() {
    const me = this;

    return Utils.buildPoint(
      me._container.x + me._hand.x,
      me._container.y + me._hand.y
    );
  }

  _onPointerMove(pointer) {
    const me = this;

    if (!Here._.input.mouse.locked) return;

    me._hand.x += pointer.movementX;
    me._hand.y += pointer.movementY;

    const distance = Math.sqrt(
      me._hand.x * me._hand.x + me._hand.y * me._hand.y
    );
    const maxDistance = 100;
    if (distance > maxDistance) {
      const ratio = maxDistance / distance;
      me._hand.setPosition(me._hand.x * ratio, me._hand.y * ratio);
    }
  }

  _updateMovement() {
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
}
