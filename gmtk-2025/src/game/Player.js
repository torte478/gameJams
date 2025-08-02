import Here from "../framework/Here.js";

export default class Player {
  /** @type {Phaser.GameObjects.Sprite} */
  _sprite;

  /** @type {Phaser.GameObjects.Container} */
  _container;

  /** @type {Number} */
  direction;

  /** @type {Boolean} */
  isShield;

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
    me.isShield = false;
    me._sprite.setFrame(0);
  }

  toIdle() {
    const me = this;

    me._sprite.setFrame(0);
    me.isShield = false;
  }

  toAttack() {
    const me = this;

    me._sprite.setFrame(2);
  }

  toShield() {
    const me = this;

    me._sprite.setFrame(1);
    me.isShield = true;
  }

  reset() {
    const me = this;

    me._sprite.setFrame(0).setFlipX(false);

    me.direction = 1;
    me.isShield = false;
  }
}
