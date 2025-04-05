import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Config from "./Config.js";
import Enums from "./Enums.js";
import Garbage from "./Garbage.js";
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
  _mana = Config.Start.Mana;

  /** @type {Player} */
  _player;

  /** @type {Number} */
  _currentBucketDirt = 0;

  /**
   * @param {Garbage} garbage
   * @param {Player} player
   */
  constructor(garbage, player, layer) {
    const me = this;

    me._garbage = garbage;
    me._player = player;

    me._fireballPool = Here._.physics.add.group({ collideWorldBounds: true });

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
      layer,
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

    let input = -1;
    if (Here.Controls.isPressedOnce(Enums.Keyboard.HAND_TOOL)) {
      input = Enums.Tools.HAND;
      me._player._hand.stop();
      me._player._hand.setFrame(0);
    } else if (Here.Controls.isPressedOnce(Enums.Keyboard.MOP_TOOL)) {
      me._player._hand.stop();
      input = Enums.Tools.MOP;
      me._player._hand.setFrame(me._mopDirt >= Config.Tools.MaxMopDirt ? 7 : 4);
      me._tryThrowCurrentItem();
    } else if (Here.Controls.isPressedOnce(Enums.Keyboard.FIREBALL_TOOL)) {
      me._player._hand.stop();
      input = Enums.Tools.FIREBALL;
      me._player._hand.setFrame(10);
      me._tryThrowCurrentItem();
    }
    if (input === -1) return;

    me.currentTool = input;
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

  increaseMana(change) {
    const me = this;

    me._mana = Math.min(Config.Tools.MaxMana, me._mana + change);
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
      "items",
      3
    );
    fireball.isFireball = true;
    fireball.body.onWorldBounds = true;
    fireball.setVelocity(velocity.x, velocity.y);

    me._mana = Math.max(0, me._mana - Config.Tools.FireballCost);
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
      return;
    }

    for (let i = 0; i < bodies.length; ++i) {
      const gameObj = bodies[i].gameObject;
      if (!gameObj.isGarbage) continue;

      me._garbage.removeGarbage(gameObj);
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
      5,
      true,
      true
    );

    const bucket = Utils.firstOrNull(bodies, (b) => !!b.gameObject.isBucket);
    if (!!bucket) return me._onBucketClickByMop(bucket.gameObject);

    if (me._mopDirt < Config.Tools.MaxMopDirt) {
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

      if (bucket.dirt >= Config.Tools.MaxBucketDirt) {
        bucket.setFrame(2);
        bucket.nextSpot = MyStaticTime.time + Config.Player.SpotCreatePeriodSec;
      }
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
  }

  _onFireballHit(fireball) {
    const me = this;

    fireball.destroy();

    const bodies = Here._.physics.overlapCirc(
      fireball.x,
      fireball.y,
      100,
      true,
      true
    );
    for (let i = 0; i < bodies.length; ++i) {
      const gameObj = bodies[i].gameObject;

      if (!!gameObj.isBag) {
        me._garbage.removeBag(gameObj);
      }

      if (!!gameObj.isBucket) {
        me._garbage.removeBucket(gameObj);
      }

      if (!!gameObj.isWall) {
        me._garbage.removeWall(gameObj);
      }
    }
  }
}
