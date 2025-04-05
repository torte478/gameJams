import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Config from "./Config.js";
import Consts from "./Consts.js";
import MyStaticTime from "./MyStaticTime.js";

export default class Garbage {
  /** @type {Phaser.Physics.Arcade.Group} */
  _garbagePool;

  /** @type {Phaser.Physics.Arcade.Group} */
  _movablePool;

  /** @type {Phaser.Physics.Arcade.Group} */
  _spotPool;

  /** @type {Phaser.Physics.Arcade.StaticGroup} */
  _wallPool;

  static _vectors = [
    { x: -1, y: -1 },
    { x: -1, y: 0 },
    { x: -1, y: 1 },
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: 1, y: -1 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
  ];

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

    Here._.physics.add.collider(
      me._movablePool,
      me._movablePool,
      null,
      (m1, m2) => {
        me._onMovableCollideProcess(m1);
        me._onMovableCollideProcess(m2);
      },
      me
    );

    Here._.physics.add.collider(
      playerGameObj,
      me._movablePool,
      null,
      (p, movable) => me._onMovableCollideProcess(movable),
      me
    );
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
   * @param {Boolean} withRandomVelocity
   * @param {Boolean} withSpot
   */
  createBag(x, y, withRandomVelocity, withSpot) {
    const me = this;

    const bag = me._movablePool.create(x, y, "items", 0);
    bag.isBag = true;

    bag.setDepth(Consts.Depth.Movable);
    bag.nextSpot = MyStaticTime.time + Config.Player.SpotCreatePeriodSec;

    if (!!withRandomVelocity) {
      const vector = Utils.getRandomEl(Garbage._vectors);
      bag.setVelocity(
        vector.x * Config.Player.BagSpawnVelocity,
        vector.y * Config.Player.BagSpawnVelocity
      );
    }

    if (!!withSpot) me.createSpot(x, y);
  }

  createBucket(x, y, dirt) {
    const me = this;

    const isDirt = dirt >= Config.Tools.MaxBucketDirt;
    const bucket = me._movablePool.create(x, y, "items", isDirt ? 2 : 1);
    bucket.isBucket = true;
    bucket.setDepth(Consts.Depth.Movable);

    bucket.dirt = dirt;
    if (isDirt) {
      me.createSpot(x, y);
      bucket.nextSpot = MyStaticTime.time + Config.Player.SpotCreatePeriodSec;
    }

    return bucket;
  }

  createSpot(x, y) {
    const me = this;

    const frame = Utils.getRandom(6, 8, 6);
    const spot = me._spotPool.create(x, y, "items", frame);
    spot.isSpot = true;
    spot.setDepth(Consts.Depth.Spot).setAngle(Utils.getRandom(0, 360, 0));
  }

  _onMovableCollideProcess(movable) {
    const me = this;

    if (movable.isBag && movable.nextSpot < MyStaticTime.time) {
      me.createSpot(movable.x, movable.y);
      movable.nextSpot = MyStaticTime.time + Config.Player.SpotCreatePeriodSec;
    }

    if (
      movable.isBucket &&
      movable.dirt >= Config.Tools.MaxBucketDirt &&
      movable.nextSpot < MyStaticTime.time
    ) {
      me.createSpot(movable.x, movable.y);
      movable.nextSpot = MyStaticTime.time + Config.Player.SpotCreatePeriodSec;
    }
  }
}
