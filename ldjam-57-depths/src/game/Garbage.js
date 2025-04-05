import Here from "../framework/Here.js";
import Config from "./Config.js";
import Consts from "./Consts.js";

export default class Garbage {
  /** @type {Phaser.Physics.Arcade.Group} */
  _garbagePool;

  /** @type {Phaser.Physics.Arcade.Group} */
  _movablePool;

  /** @type {Phaser.Physics.Arcade.Group} */
  _spotPool;

  /** @type {Phaser.Physics.Arcade.StaticGroup} */
  _wallPool;

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

    me._wallPool = Here._.physics.add.staticGroup();

    Here._.physics.add.collider(me._movablePool);

    Here._.physics.add.collider(playerGameObj, me._movablePool);
    Here._.physics.add.collider(playerGameObj, me._wallPool);
  }

  createGarbage(x, y) {
    const me = this;

    const garbage = me._garbagePool.create(x, y, "items", 0);
    garbage.isGarbage = true;
    garbage.setDepth(Consts.Depth.Garbage);
  }

  createGarbageWall(x, y) {
    const me = this;

    const wall = me._wallPool.create(x, y, "wall", 2);
    wall.setOrigin(0, 0);
    /** @type {Phaser.Physics.Arcade.Body} */
    const body = wall.body;
    body.reset();

    wall.isWall = true;
  }

  removeWall(wall) {
    const me = this;

    wall.destroy();

    const rect = new Phaser.Geom.Rectangle(
      wall.x,
      wall.y,
      Consts.Unit.Big,
      Consts.Unit.Big
    );
    for (let i = 0; i < Config.Tools.WallToGarbageCount; ++i) {
      const garbagePos = Phaser.Geom.Rectangle.Random(rect);
      me.createGarbage(garbagePos.x, garbagePos.y);
    }
  }

  removeGarbage(obj) {
    const me = this;

    obj.destroy();
  }

  removeSpot(spot) {
    const me = this;

    spot.destroy();
  }

  removeBag(bag) {
    const me = this;

    bag.destroy();
  }

  removeBucket(bucket) {
    const me = this;

    bucket.destroy();
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
