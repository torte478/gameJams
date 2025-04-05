import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
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

  constructor(playerGameObj, layer) {
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

    Here._.physics.add.collider(layer, me._movablePool);
  }

  createGarbage(x, y) {
    const me = this;

    const frame = Utils.getRandom(3, 5, 3);
    /** @type {Phaser.Physics.Arcade.Image} */
    const garbage = me._garbagePool.create(x, y, "items", frame);
    garbage.isGarbage = true;
    garbage.setDepth(Consts.Depth.Garbage).setAngle(Utils.getRandom(0, 360, 0));
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

  /**
   * @param {Number} x
   * @param {Number} y
   * @returns {Phaser.Physics.Arcade.Image}
   */
  createBag(x, y) {
    const me = this;

    const bag = me._movablePool.create(x, y, "items", 0);
    bag.isBag = true;

    bag.setDepth(Consts.Depth.Movable);

    // me.createSpot(x, y);

    return bag;
  }

  createBucket(x, y) {
    const me = this;

    const bucket = me._movablePool.create(x, y, "items", 1);
    bucket.isBucket = true;
    bucket.setDepth(Consts.Depth.Movable);

    bucket.dirt = 0;

    return bucket;
  }

  createSpot(x, y) {
    const me = this;

    const frame = Utils.getRandom(6, 8, 6);
    const spot = me._spotPool.create(x, y, "items", frame);
    spot.isSpot = true;
    spot.setDepth(Consts.Depth.Spot).setAngle(Utils.getRandom(0, 360, 0));
  }
}
