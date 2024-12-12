import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Bullets from "./Bullets.js";
import Cursor from "./Cursor.js";

export default class Lera {
  /** @type{Phaser.GameObjects.Container} */
  _container;

  /** @type {Bullets} */
  _bullets;

  /** @type {Cursor} */
  _cursor;

  /**
   * @param {Bullets} bullets
   * @param {Cursor} cursor
   */
  constructor(bullets, cursor) {
    const me = this;

    me._bullets = bullets;
    me._cursor = cursor;

    const sprite = Here._.add.image(0, 0, "placeholder80", 1);

    me._container = Here._.add
      .container(600, 300, [sprite])
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

    // const dirX = mousePos.x - me._container.x;
    // const dirY = mousePos.y - me._container.y;

    // const length = Math.sqrt(dirX * dirX + dirY * dirY) + Phaser.Math.EPSILON;
    // const nDirX = dirX / length;
    // const nDirY = dirY / length;

    // me._aim.setPosition(
    //   nDirX * Config.Lera.AimOffset,
    //   nDirY * Config.Lera.AimOffset
    // );
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

    me._bullets.shot(me._container, me._cursor.getPos());
  }
}
