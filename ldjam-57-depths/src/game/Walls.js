import Here from "../framework/Here.js";

export default class Walls {
  /** @type {Phaser.Physics.Arcade.StaticGroup} */
  _wallPool;

  constructor(player) {
    const me = this;

    me._wallPool = Here._.physics.add.staticGroup();

    Here._.physics.add.collider(me._wallPool, player.toGameObject());
  }

  createWall(x, y) {
    const me = this;

    const wall = me._wallPool.create(x, y, "wall", 0);
    wall.setOrigin(0, 0);
    /** @type {Phaser.Physics.Arcade.Body} */
    const body = wall.body;
    body.reset();

    wall.isWall = true;
  }

  removeWall(wall) {
    const me = this;

    wall.destroy();
  }
}
