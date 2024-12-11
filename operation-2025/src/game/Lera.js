import Here from "../framework/Here.js";
import Config from "./Config.js";
import Consts from "./Consts.js";

export default class Lera {
  /** @type{Phaser.GameObjects.Container} */
  _container;

  /** @type {Phaser.GameObjects.Image} */
  _aim;

  constructor() {
    const me = this;

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
}
