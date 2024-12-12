import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Config from "./Config.js";
import Consts from "./Consts.js";

export default class Lera {
  /** @type{Phaser.GameObjects.Container} */
  _container;

  /** @type {Phaser.GameObjects.Image} */
  _aim;

  /** @type {Phaser.Physics.Arcade.Group} */
  _bulletPool;

  /**
   * @param {Phaser.Physics.Arcade.Group} bulletPool
   */
  constructor(bulletPool) {
    const me = this;

    me._bulletPool = bulletPool;

    const sprite = Here._.add.image(0, 0, "placeholder80", 1);

    me._aim = Here._.add
      .image(0, 0, "placeholder40", 1)
      .setDepth(Consts.Depth.GUI);

    me._container = Here._.add
      .container(600, 300, [sprite, me._aim])
      .setSize(sprite.width, sprite.height);

    Here._.physics.world.enable(me._container);

    const body = me._getBody();
    body.setSlideFactor(0, 0);
    body.pushable = true;

    Here._.input.on("pointerdown", (_) => me._onMouseClick(), me);
  }

  /**
   * @returns {Phaser.GameObjects.Container}
   */
  getGameObject() {
    const me = this;
    return me._container;
  }

  /**
   * @param {Phaser.Math.Vector2} mousePos
   */
  update(mousePos) {
    const me = this;

    const dirX = mousePos.x - me._container.x;
    const dirY = mousePos.y - me._container.y;

    const length = Math.sqrt(dirX * dirX + dirY * dirY) + Phaser.Math.EPSILON;
    const nDirX = dirX / length;
    const nDirY = dirY / length;

    me._aim.setPosition(
      nDirX * Config.Lera.AimOffset,
      nDirY * Config.Lera.AimOffset
    );
  }

  /**
   * @returns {Phaser.Physics.Arcade.Body}
   */
  _getBody() {
    const me = this;
    return me._container.body;
  }

  _onMouseClick() {
    const me = this;

    /** @type {Phaser.Physics.Arcade.Image} */
    const bullet = me._bulletPool.get(
      me._container.x,
      me._container.y,
      "placeholder40",
      2
    );

    bullet.body.enable = true;
    bullet.body.reset(bullet.x, bullet.y);

    bullet
      .setActive(true)
      .setVisible(true)
      .setVelocity(
        Config.Lera.BulletSpeed * (me._aim.x / Config.Lera.AimOffset),
        Config.Lera.BulletSpeed * (me._aim.y / Config.Lera.AimOffset)
      );

    // TODO
    Here._.time.delayedCall(1000, () => {
      bullet.setActive(false).setVisible(false);
      bullet.body.enable = false;
    });
  }
}
