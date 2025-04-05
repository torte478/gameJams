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
  _sprite;

  /** @type {Phaser.GameObjects.Sprite} */
  _hand;

  /** @type {Number} */
  _garbageCount = 0;

  constructor() {
    const me = this;

    me._sprite = Here._.add.sprite(5, 0, "player_idle", 0);
    me._hand = Here._.add.sprite(50, 50, "hand", 0).setDepth(Consts.Depth.UI);

    me._container = Here._.add
      .container(Config.Start.PlayerX, Config.Start.PlayerY, [
        me._sprite,
        me._hand,
      ])
      .setSize(Consts.Unit.Normal, Consts.Unit.Normal);

    Here._.physics.world.enable(me._container);
    /** @type {Phaser.Physics.Arcade.Body} */
    const body = me._container.body;

    body.setBounce(1, 1).setCircle(30);

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

  setHandContent(content) {
    const me = this;

    if (content == Enums.HandContent.EMPTY) {
      return me._hand.setFrame(0);
    }

    if (content == Enums.HandContent.BAG) {
      return me._hand.setFrame(1);
    }

    throw "error";
  }

  setTool(tool) {
    const me = this;

    if (tool == Enums.Tools.HAND) {
      return me._hand.setFrame(0); // TODO
    }

    if (tool == Enums.Tools.MOP) {
      return me._hand.setFrame(4); // TODO
    }

    if (tool == Enums.Tools.FIREBALL) {
      return me._hand.setFrame(10);
    }

    throw "error";
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

      me._sprite.play("player_idle", true);
      return;
    }

    if (dx !== 0 && dy !== 0) {
      const normalizeFactor = Math.sqrt(2) / 2;
      dx *= normalizeFactor;
      dy *= normalizeFactor;
    }

    body.setVelocity(dx * Config.Player.Speed, dy * Config.Player.Speed);
    me._sprite.play("player_walk", true);
  }
}
