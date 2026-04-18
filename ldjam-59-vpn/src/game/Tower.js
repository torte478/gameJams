import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";

export default class Tower {
  /** @type {Number} */
  id;

  /** @type {Phaser.GameObjects.Sprite} */
  _sprite;

  /** @type {Phaser.GameObjects.Container} */
  _container;

  /**
   * @param {Number} id
   * @param {Number} x
   * @param {Number} y
   * @param {String} labe
   */
  constructor(id, x, y, label) {
    const me = this;

    me.id = id;

    me._sprite = Here._.add.sprite(0, 0, "tower", 0);
    const labelText = Here._.add.text(0, 26, label, { fontSize: 20 });
    me._container = Here._.add.container(x, y, [me._sprite, labelText]);

    me._container
      .setSize(me._sprite.width, me._sprite.height)
      .setInteractive()
      .on("pointerover", () => {
        me._sprite.setTint(0x44ff44);
      })
      .on("pointerout", () => {
        me._sprite.clearTint();
      });
    //   .on("pointerdown", () => {
    //     context.setSelectedTower(me);
    //   })
  }

  toGameObj() {
    const me = this;

    return me._container;
  }

  /**
   * @param {Phaser.Math.Vector2} pos
   * @returns {Boolean}
   */
  containsPoint(pos) {
    const me = this;

    return Phaser.Geom.Rectangle.ContainsPoint(me._container.getBounds(), pos);
  }
}
