import Here from "../framework/Here.js";
import Consts from "./Consts.js";

export default class Garbage {
  /** @type {Phaser.Physics.Arcade.Group} */
  _garbagePool;

  /** @type {Phaser.Physics.Arcade.Group} */
  _garbagePool;

  /** @type {Phaser.Physics.Arcade.Group} */
  _spotPool;

  constructor(playerGameObj) {
    const me = this;

    me._garbagePool = Here._.physics.add.group();

    const bagBounce = 0.25;
    const bagDrag = 500;
    me._bagPool = Here._.physics.add.group({
      bounceX: bagBounce,
      bounceY: bagBounce,
      collideWorldBounds: true,
      dragX: bagDrag,
      dragY: bagDrag,
    });

    me._spotPool = Here._.physics.add.group();

    Here._.physics.add.collider(me._bagPool);

    Here._.physics.add.collider(playerGameObj, me._bagPool);
  }

  createGarbage(x, y) {
    const me = this;

    const garbage = me._garbagePool.create(x, y, "items", 0);
    garbage.isGarbage = true;
    garbage.setDepth(Consts.Depth.Garbage);
  }

  removeGarbage(obj) {
    const me = this;

    obj.destroy();
  }

  createBag(pos) {
    const me = this;

    const bag = me._bagPool.create(pos.x, pos.y, "items", 1);
    bag.isBag = true;

    // bag.setDepth(Consts.Depth.Bag);

    me.createSpot(pos);
  }

  createSpot(pos) {
    const me = this;

    const spot = me._spotPool.create(pos.x, pos.y, "items", 2);
    spot.isSpot = true;
    spot.setDepth(Consts.Depth.Spot);
  }
}
