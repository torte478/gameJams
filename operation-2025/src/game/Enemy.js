import Utils from "../framework/Utils.js";
import Config from "./Config.js";

export default class Enemy {
  /** @type {Phaser.Math.Vector2} */
  _target;

  /** @type {Phaser.Physics.Arcade.Sprite} */
  _sprite;

  /**
   * @param {Phaser.Physics.Arcade.Group} pool
   * @param {Number} x
   * @param {Number} y
   * @param {Phaser.Math.Vector2} target
   */
  constructor(pool, x, y, target) {
    const me = this;

    me._target = target;

    me._sprite = pool.get(x, y, "placeholder80", 2);
    me._sprite.body.enable = true;
    me._sprite.body.reset(x, y);

    me._sprite.setActive(true).setVisible(true);
  }

  update() {
    const me = this;

    const direction = Utils.getDirection(me._sprite, me._target);

    me._sprite.setVelocity(
      direction.x * Config.Enemy.Speed,
      direction.y * Config.Enemy.Speed
    );
  }
}
