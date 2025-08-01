import Here from "../framework/Here.js";

export default class Player {
  /** @type {Phaser.GameObjects.Sprite} */
  _sprite;

  /** @type {Phaser.GameObjects.Container} */
  _container;

  /** @type {Number} */
  direction;

  /** @type {Boolean} */
  isDead;

  /** @type {Boolean} */
  isShield;

  constructor() {
    const me = this;

    me._sprite = Here._.add.sprite(0, 0, "player", 0);
    me._container = Here._.add.container(0, 0, [me._sprite]);

    me.direction = 1;
    me.isDead = false;
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
    me.isDead = false;
    me.isShield = false;
  }

  die() {
    const me = this;

    me._sprite.setFrame(3);
    me.isDead = true;
    me.isShield = false;
  }
}
