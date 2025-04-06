import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Config from "./Config.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";
import Garbage from "./Garbage.js";
import Graphics from "./Graphics.js";
import Lights from "./Lights.js";
import MyStaticTime from "./MyStaticTime.js";
import Player from "./Player.js";

export default class Tools {
  /** @type {Garbage} */
  _garbage;

  /** @type {Number} */
  currentTool = Enums.Tools.HAND;

  /** @type {Number} */
  _bagGarbageCount = 0;

  /** @type {Number} */
  _mopDirt = 0;

  /** @type {Number} */
  _handContentType = Enums.HandContent.EMPTY;

  /** @type {Phaser.Physics.Arcade.Group} */
  _fireballPool;

  /** @type {Number} */
  _mana = 0;

  /** @type {Player} */
  _player;

  /** @type {Number} */
  _currentBucketDirt = 0;

  /** @type {Number} */
  _fireballLight = 0;

  /** @type {Lights} */
  _lights;

  /** @type {Phaser.Physics.Arcade.Image} */
  _flyingFireball = null;

  /** @type {Phaser.Tilemaps.Tilemap} */
  _map;

  /** @type {Phaser.Physics.Arcade.StaticGroup} */
  _campfirePool;

  /** @type {Phaser.GameObjects.Text} */
  _barManaText;

  /** @type {Graphics} */
  _graphics;

  constructor(garbage, player, lights, map, mapLayer, graphics) {
    const me = this;

    me._garbage = garbage;
    me._player = player;
    me._lights = lights;
    me._map = map;
    me._graphics = graphics;

    Here._.add
      .image(0, 0, "bar")
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(Consts.Depth.UI);

    me._barManaText = Here._.add
      .text(55, 50, "1", {
        fontFamily: "Arial Black",
        fontSize: 32,
        color: "#fceaff",
      })
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0)
      .setDepth(Consts.Depth.UI);

    me.changeMana(Config.Start.Mana);

    me._createIcon(130, 36, 0);
    me._createIcon(200, 36, 1);
    me._createIcon(270, 36, 2);

    me._fireballPool = Here._.physics.add.group({ collideWorldBounds: true });

    me._campfirePool = Here._.physics.add.staticGroup();
    for (let i = 0; i < me._map.height; ++i)
      for (let j = 0; j < me._map.width; ++j) {
        const tile = me._map.getTileAt(j, i, true);
        if (tile.index != 3) continue;

        const firecamp = me._campfirePool.create(
          tile.getCenterX(),
          tile.getCenterY(),
          "fire",
          0,
          false
        );
        firecamp.isFirecamp = true;
      }

    Here._.physics.world.on(
      "worldbounds",
      (body) => {
        const gameObj = body.gameObject;
        if (!!gameObj.isFireball) {
          me._onFireballHit(gameObj);
        }
      },
      me
    );

    Here._.physics.add.collider(
      me._fireballPool,
      me._garbage._movablePool,
      (fireball, movable) => me._onFireballHit(fireball),
      null,
      me
    );

    Here._.physics.add.collider(
      me._fireballPool,
      mapLayer,
      (fireball, l) => me._onFireballHit(fireball),
      null,
      me
    );

    Here._.physics.add.collider(
      me._fireballPool,
      me._garbage._wallPool,
      (f, m) => me._onFireballHit(f),
      null,
      me
    );
  }

  update() {
    const me = this;

    const playerCursorPos = me._player.toMousePos();

    let input = -1;
    if (Here.Controls.isPressedOnce(Enums.Keyboard.HAND_TOOL)) {
      input = Enums.Tools.HAND;
      me._player._hand.stop();
      me._player._hand.setFrame(0);
      me._fireballLight = 0;
      me._graphics._fireEmitter.stop();
      me._lights.updateTiles(null);
    } else if (Here.Controls.isPressedOnce(Enums.Keyboard.MOP_TOOL)) {
      me._player._hand.stop();
      input = Enums.Tools.MOP;
      me._player._hand.setFrame(me._mopDirt >= Config.Tools.MaxMopDirt ? 7 : 4);
      me._tryThrowCurrentItem();
      me._fireballLight = 0;
      me._graphics._fireEmitter.stop();
      me._lights.updateTiles(null);
    } else if (Here.Controls.isPressedOnce(Enums.Keyboard.FIREBALL_TOOL)) {
      me._player._hand.stop();
      input = Enums.Tools.FIREBALL;
      const isBigFireball = me._mana >= Config.Tools.FireballCost;
      me._player._hand.setFrame(isBigFireball ? 11 : 10);
      me._tryThrowCurrentItem();
      me._fireballLight = isBigFireball
        ? Config.Light.BigFireballLight
        : Config.Light.LitleFireballLight;
      if (isBigFireball) me._graphics._fireEmitter.start();
      else me._graphics._fireEmitter.stop();
    }

    if (me._fireballLight > 0 || !!me._flyingFireball) {
      me._lights.updateTilesWithFireball(
        me._player.toMousePos(),
        me._fireballLight,
        me._flyingFireball,
        Config.Light.BigFireballLight
      );

      if (!!me._flyingFireball)
        me._graphics._fireEmitter.setPosition(
          me._flyingFireball.x,
          me._flyingFireball.y
        );
      else
        me._graphics._fireEmitter.setPosition(
          playerCursorPos.x,
          playerCursorPos.y
        );
    }

    if (input === -1) return;

    me.currentTool = input;
    Here._.sound.play("take_garbage");
  }

  onPointerDown(pos, playerPos) {
    const me = this;

    if (me.currentTool == Enums.Tools.HAND) {
      return me._processHandClick(pos);
    }
    if (me.currentTool == Enums.Tools.MOP) {
      return me._processMopClick(pos);
    }

    if (me.currentTool == Enums.Tools.FIREBALL) {
      return me._processFireballClick(pos, playerPos);
    }
  }

  _createIcon(x, y, frame) {
    const me = this;

    Here._.add
      .image(x, y, "icons", frame)
      .setScrollFactor(0)
      .setDepth(Consts.Depth.UI);
  }

  _tryThrowCurrentItem() {
    const me = this;

    if (me._handContentType == Enums.HandContent.EMPTY) return;

    const playerPos = me._player.toGameObject();

    if (me._handContentType == Enums.HandContent.BAG) {
      me._garbage.createBag(playerPos.x, playerPos.y, true, true);
      me._handContentType = Enums.HandContent.EMPTY;
      return;
    }

    if (me._handContentType == Enums.HandContent.BUCKET) {
      me._garbage.createBucket(playerPos.x, playerPos.y, me._currentBucketDirt);
      me._currentBucketDirt = 0;
      return;
    }

    throw "error";
  }

  _processFireballClick(cursorPos, playerPos) {
    const me = this;

    if (me._mana < Config.Tools.FireballCost) {
      Here._.sound.play("no_mana");
      return;
    }

    const dx = cursorPos.x - playerPos.x;
    const dy = cursorPos.y - playerPos.y;
    const angleRad = Math.atan2(dy, dx);
    let angleDeg = angleRad * (180 / Math.PI);

    const velocity = Here._.physics.velocityFromAngle(
      angleDeg,
      Config.Tools.FireballSpeed
    );

    const fireball = me._fireballPool.create(
      cursorPos.x,
      cursorPos.y,
      "hand",
      11
    );
    fireball.isFireball = true;
    fireball.body.onWorldBounds = true;
    fireball.setVelocity(velocity.x, velocity.y);
    Here._.sound.play("fireball_start");

    me.changeMana(-Config.Tools.FireballCost);

    if (me._mana < Config.Tools.FireballCost) {
      me._player._hand.setFrame(10);
      me._fireballLight = Config.Light.LitleFireballLight;
      me._graphics._fireEmitter.stop();
    }

    me._flyingFireball = fireball;
    if (me._destroyAllThatFireballHits(fireball)) {
      me._fireballExplosion(fireball);
    }
  }

  changeMana(change) {
    const me = this;

    me._mana = Math.max(0, me._mana + change);
    me._barManaText.setText(me._mana);
  }

  _processHandClick(pos) {
    const me = this;

    if (me._handContentType == Enums.HandContent.EMPTY)
      return me._processEmptyHandClick(pos);

    if (me._handContentType == Enums.HandContent.BAG)
      return me._processBagHandClick(pos);

    if (me._handContentType == Enums.HandContent.BUCKET)
      return me._processBucketHandClick(pos);
  }

  _processBucketHandClick(pos) {
    const me = this;

    me._garbage.createBucket(pos.x, pos.y, me._currentBucketDirt);
    Here._.sound.play("take_garbage");
    me._currentBucketDirt = 0;
    me._handContentType = Enums.HandContent.EMPTY;
    me._player._hand.setFrame(0);
  }

  _processBagHandClick(pos) {
    const me = this;

    me._garbage.createBag(pos.x, pos.y, false, true);
    me._handContentType = Enums.HandContent.EMPTY;
    me._player._hand.setFrame(0);
  }

  _processEmptyHandClick(pos) {
    const me = this;

    const bodies = Here._.physics.overlapCirc(pos.x, pos.y, 5, true, true);
    const bag = Utils.firstOrNull(bodies, (b) => !!b.gameObject.isBag);
    if (!!bag) {
      me._handContentType = Enums.HandContent.BAG;
      me._garbage.removeBag(bag.gameObject);
      me._player._hand.setFrame(1);
      Here._.sound.play("take_garbage");
      return;
    }

    const bucket = Utils.firstOrNull(bodies, (b) => !!b.gameObject.isBucket);
    if (!!bucket) {
      me._handContentType = Enums.HandContent.BUCKET;
      me._currentBucketDirt = bucket.gameObject.dirt;
      const handFrame =
        me._currentBucketDirt >= Config.Tools.MaxBucketDirt ? 3 : 2;
      me._player._hand.setFrame(handFrame);
      me._garbage.removeBucket(bucket.gameObject);
      Here._.sound.play("take_garbage");
      return;
    }

    for (let i = 0; i < bodies.length; ++i) {
      const gameObj = bodies[i].gameObject;
      if (!gameObj.isGarbage) continue;

      me._garbage.removeGarbage(gameObj);
      Here._.sound.play("take_garbage");

      me._tryCreateBagFromGarbage();
      return;
    }
  }

  _processMopClick(pos) {
    const me = this;

    const mopDummyOffset = 20;
    const mopPos = Utils.buildPoint(pos.x, pos.y + mopDummyOffset);

    const bodies = Here._.physics.overlapCirc(
      mopPos.x,
      mopPos.y + mopDummyOffset,
      10,
      true,
      true
    );

    const bucket = Utils.firstOrNull(bodies, (b) => !!b.gameObject.isBucket);
    if (!!bucket) return me._onBucketClickByMop(bucket.gameObject);

    if (me._mopDirt < Config.Tools.MaxMopDirt) {
      me._graphics.waterParticles(mopPos.x, mopPos.y);
      return me._tryCleanSpot(mopPos);
    } else {
      me._player._hand.play("mop_dirt");
      return me._createSpot(mopPos);
    }
  }

  _onBucketClickByMop(bucket) {
    const me = this;

    if (bucket.dirt < Config.Tools.MaxBucketDirt) {
      Utils.debugLog(`${bucket.dirt} + ${me._mopDirt}`);

      bucket.dirt += me._mopDirt;
      me._mopDirt = 0;
      me._player._hand.setFrame(4);

      me._graphics.waterParticles(bucket.x, bucket.y);
      Here._.sound.play("mop_wash");

      if (bucket.dirt >= Config.Tools.MaxBucketDirt) {
        bucket.setFrame(2);
        bucket.nextSpot = MyStaticTime.time + Config.Player.SpotCreatePeriodSec;
      }
    } else {
      me._garbage.createSpot(bucket.x, bucket.y);
      me._mopDirt = Config.Tools.MaxMopDirt;
      me._player._hand.setFrame(7);
    }
  }

  _tryCleanSpot(pos) {
    const me = this;

    const bodies = Here._.physics.overlapCirc(pos.x, pos.y, 10, true, true);

    for (let i = 0; i < bodies.length; ++i) {
      const gameObj = bodies[i].gameObject;
      if (!gameObj.isSpot) continue;

      me._garbage.removeSpot(gameObj);
      me._mopDirt += 1;
    }

    const anim =
      me._mopDirt >= Config.Tools.MaxMopDirt ? "mop_dirt" : "mop_clean";
    me._player._hand.play(anim);
    Here._.sound.play("mop");
  }

  _createSpot(pos) {
    const me = this;

    me._garbage.createSpot(pos.x, pos.y);
  }

  _tryCreateBagFromGarbage() {
    const me = this;

    me._bagGarbageCount += 1;
    if (me._bagGarbageCount < Config.Tools.MaxGarbageCountAtBag) {
      return;
    }

    me._bagGarbageCount = 0;

    const playerPos = me._player.toGameObject();
    me._garbage.createBag(playerPos.x, playerPos.y, true, false);
    Here._.sound.play("bag_spawned");
  }

  _onFireballHit(fireball) {
    const me = this;

    me._destroyAllThatFireballHits(fireball);
    me._fireballExplosion(fireball);
  }

  _fireballExplosion(fireball) {
    const me = this;

    me._graphics.explosion(fireball.x, fireball.y);

    fireball.destroy();
    me._flyingFireball = null;
    me._lights.updateTiles();
    Here._.cameras.main.shake(500, 0.01);
    Here._.sound.play("fireball_explosion");
  }

  _destroyAllThatFireballHits(fireball) {
    const me = this;

    const bodies = Here._.physics.overlapCirc(
      fireball.x,
      fireball.y,
      100,
      true,
      true
    );
    let hits = false;
    for (let i = 0; i < bodies.length; ++i) {
      const gameObj = bodies[i].gameObject;

      const tileIndex = me._map.getTileAtWorldXY(
        fireball.x,
        fireball.y,
        true
      ).index;
      if (tileIndex != -1 && tileIndex != 0) {
        hits = true;
      }

      if (!!gameObj.isBag) {
        me._garbage.removeBag(gameObj);
        hits = true;
      }

      if (!!gameObj.isBucket) {
        me._garbage.removeBucket(gameObj);
        hits = true;
      }

      if (!!gameObj.isWall) {
        me._garbage.removeWall(gameObj);
        hits = true;
      }

      if (!!gameObj.isFirecamp) {
        Here._.add
          .sprite(gameObj.x, gameObj.y, "fire", 0)
          .play("fire")
          .setDepth(Consts.Depth.FloorPlusOne);

        const tile = me._lights._tilemap.worldToTileXY(
          gameObj.x - 10,
          gameObj.y - 10
        );
        me._lights.addLightSources([{ x: tile.x + 1, y: tile.y + 1 }]);

        gameObj.destroy();
        hits = true;
      }
    }

    return hits;
  }
}
