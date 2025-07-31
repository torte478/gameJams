import Here from "../framework/Here.js";

export default class Player {
  /** @type {Phaser.GameObjects.Sprite} */
  _sprite;

  /** @type {Phaser.GameObjects.Container} */
  _container;

  /** @type {Number} */
  direction;

  constructor() {
    const me = this;

    me._sprite = Here._.add.sprite(0, 0, "player", 0);
    me._container = Here._.add.container(0, 0, [me._sprite]);

    me.direction = 1;
  }

  toGameObject() {
    const me = this;

    return me._container;
  }

  turn() {
    const me = this;

    me.direction *= -1;
    me._sprite.setFlipX(me.direction == -1);
  }
}
