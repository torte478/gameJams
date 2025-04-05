import Here from "../framework/Here.js";
import Consts from "./Consts.js";

export default class Garbage {
  /** @type {Phaser.Physics.Arcade.Group} */
  _garbagePool;

  /** @type {Phaser.Physics.Arcade.Group} */
  _movablePool;

  /** @type {Phaser.Physics.Arcade.Group} */
  _spotPool;

  constructor(playerGameObj) {
    const me = this;

    me._garbagePool = Here._.physics.add.staticGroup();

    const bounce = 0.25;
    const drag = 500;

    me._movablePool = Here._.physics.add.group({
      bounceX: bounce,
      bounceY: bounce,
      collideWorldBounds: true,
      dragX: drag,
      dragY: drag,
    });

    me._spotPool = Here._.physics.add.staticGroup();

    Here._.physics.add.collider(me._movablePool);

    Here._.physics.add.collider(playerGameObj, me._movablePool);
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

  removeSpot(spot) {
    const me = this;

    spot.destroy();
  }

  createBag(x, y) {
    const me = this;

    const bag = me._movablePool.create(x, y, "items", 1);
    bag.isBag = true;

    bag.setDepth(Consts.Depth.Movable);

    me.createSpot(x, y);
  }

  createBucket(x, y) {
    const me = this;

    const bucket = me._movablePool.create(x, y, "items", 4);
    bucket.isBucket = true;
    bucket.setDepth(Consts.Depth.Movable);

    bucket.dirt = 0;

    return bucket;
  }

  createSpot(x, y) {
    const me = this;

    const spot = me._spotPool.create(x, y, "items", 2);
    spot.isSpot = true;
    spot.setDepth(Consts.Depth.Spot);
  }
}
