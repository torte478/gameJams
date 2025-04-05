import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Config from "./Config.js";
import Enums from "./Enums.js";
import Garbage from "./Garbage.js";

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

  /**
   * @param {Garbage} garbage
   */
  constructor(garbage, walls) {
    const me = this;

    me._garbage = garbage;
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
    } else if (Here.Controls.isPressedOnce(Enums.Keyboard.MOP_TOOL)) {
      input = Enums.Tools.MOP;
    } else if (Here.Controls.isPressedOnce(Enums.Keyboard.FIREBALL_TOOL)) {
      input = Enums.Tools.FIREBALL;
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

    me._garbage.createBucket(pos.x, pos.y);
    me._handContentType = Enums.HandContent.EMPTY;
  }

  _processBagHandClick(pos) {
    const me = this;

    me._garbage.createBag(pos.x, pos.y);
    me._handContentType = Enums.HandContent.EMPTY;
  }

  _processEmptyHandClick(pos) {
    const me = this;

    const bodies = Here._.physics.overlapCirc(pos.x, pos.y, 5, true, true);
    const bag = Utils.firstOrNull(bodies, (b) => !!b.gameObject.isBag);
    if (!!bag) {
      me._handContentType = Enums.HandContent.BAG;
      me._garbage.removeBag(bag.gameObject);
      return;
    }

    const bucket = Utils.firstOrNull(bodies, (b) => !!b.gameObject.isBucket);
    if (!!bucket) {
      me._handContentType = Enums.HandContent.BUCKET;
      me._garbage.removeBucket(bucket.gameObject);
      return;
    }

    for (let i = 0; i < bodies.length; ++i) {
      const gameObj = bodies[i].gameObject;
      if (!gameObj.isGarbage) continue;

      me._garbage.removeGarbage(gameObj);
      me._addGarbageToHands();
      return;
    }
  }

  _processMopClick(pos) {
    const me = this;

    const bodies = Here._.physics.overlapCirc(pos.x, pos.y, 5, true, true);
    const bucket = Utils.firstOrNull(bodies, (b) => !!b.gameObject.isBucket);
    if (!!bucket) return me._onBucketClick(bucket.gameObject);

    if (me._mopDirt < Config.Tools.MaxMopDirt) {
      return me._tryCleanSpot(pos);
    } else {
      return me._createSpot(pos);
    }
  }

  _onBucketClick(bucket) {
    const me = this;

    if (bucket.dirt < Config.Tools.MaxBucketDirt) {
      Utils.debugLog(`${bucket.dirt} + ${me._mopDirt}`);

      bucket.dirt += me._mopDirt;
      me._mopDirt = 0;

      if (bucket.dirt >= Config.Tools.MaxBucketDirt) bucket.setFrame(5);
    }
  }

  _tryCleanSpot(pos) {
    const me = this;

    const bodies = Here._.physics.overlapCirc(pos.x, pos.y, 5, true, true);

    for (let i = 0; i < bodies.length; ++i) {
      const gameObj = bodies[i].gameObject;
      if (!gameObj.isSpot) continue;

      me._garbage.removeSpot(gameObj);
      me._mopDirt += 1;
      return;
    }
  }

  _createSpot(pos) {
    const me = this;

    me._garbage.createSpot(pos.x, pos.y);
    me._mopDirt -= 1;
  }

  _addGarbageToHands() {
    const me = this;

    me._bagGarbageCount += 1;
    if (me._bagGarbageCount < Config.Tools.MaxGarbageCountAtBag) {
      return false;
    }

    me._handContentType = Enums.HandContent.BAG;
    me._bagGarbageCount = 0;
    return true;
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
