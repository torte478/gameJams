import Here from "../framework/Here.js";

export default class Garbage {
  /** @type {Phaser.Physics.Arcade.Group} */
  _garbagePool;

  constructor() {
    const me = this;

    me._garbagePool = Here._.physics.add.group();
  }

  createGarbage(x, y) {
    const me = this;

    const garbage = me._garbagePool.create(x, y, "garbage", 0);
    garbage.isGarbage = true;
  }

  removeGarbage(obj) {
    const me = this;

    obj.destroy();
  }
}
