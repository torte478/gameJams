import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Config from "./Config.js";

export default class Bullets {
  /** @type {Phaser.Physics.Arcade.Group} */
  _pool;

  constructor() {
    const me = this;

    me._pool = Here._.physics.add.group();
  }

  getPool() {
    const me = this;
    return me._pool;
  }

  shot(from, to) {
    const me = this;

    /** @type {Phaser.Physics.Arcade.Image} */
    const bullet = me._pool.get(from.x, from.y, "placeholder40", 2);

    bullet.body.enable = true;
    bullet.body.reset(bullet.x, bullet.y);

    const direction = Utils.getDirection(from, to);

    bullet
      .setActive(true)
      .setVisible(true)
      .setVelocity(
        direction.x * Config.Lera.BulletSpeed,
        direction.y * Config.Lera.BulletSpeed
      );

    // TODO
    Here._.time.delayedCall(1000, () => me.onHit(bullet), me);
  }

  onHit(bullet) {
    const me = this;

    bullet.setActive(false).setVisible(false);
    bullet.body.enable = false;
  }
}
