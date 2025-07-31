import Here from "../framework/Here.js";

export default class Player {
  /** @type {Phaser.GameObjects.Container} */
  _container;

  constructor() {
    const me = this;

    const sprite = Here._.add.sprite(0, 0, "player", 0);
    me._container = Here._.add.container(0, 0, [sprite]);
  }

  toGameObject() {
    const me = this;

    return me._container;
  }
}
