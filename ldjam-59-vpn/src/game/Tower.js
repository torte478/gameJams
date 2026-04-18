import Here from "../framework/Here.js";

export default class Tower {
  /** @type {Phaser.GameObjects.Sprite} */
  _sprite;

  /** @type {Phaser.GameObjects.Container} */
  _container;

  constructor(x, y, label) {
    const me = this;

    me._sprite = Here._.add.sprite(0, 0, "tower", 0);
    const labelText = Here._.add.text(0, 26, label, { fontSize: 20 });
    me._container = Here._.add.container(x, y, [me._sprite, labelText]);
  }
}
