import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Config from "./Config.js";
import Enums from "./Enums.js";
import Garbage from "./Garbage.js";

export default class Tools {
  /** @type {Garbage} */
  _garbage;

  /** @type {Number} */
  currentTool;

  /** @type {Number} */
  _bagGarbageCount = 0;

  _mopDirt = 0;

  constructor(garbage) {
    const me = this;

    me.currentTool = Enums.Tool.HAND;
    me._garbage = garbage;
  }

  update() {
    const me = this;

    let input = -1;
    if (Here.Controls.isPressedOnce(Enums.Keyboard.HAND_TOOL)) {
      input = Enums.Tool.HAND;
    } else if (Here.Controls.isPressedOnce(Enums.Keyboard.MOP_TOOL)) {
      input = Enums.Tool.MOP;
    } else if (Here.Controls.isPressedOnce(Enums.Keyboard.FIREBALL_TOOL)) {
      input = Enums.Tool.FIREBALL;
    }
    if (input === -1) return;

    me.currentTool = input;
  }

  onPointerDown(pos) {
    const me = this;

    if (me.currentTool == Enums.Tool.HAND) {
      return me._processHandClick(pos);
    }
    if (me.currentTool == Enums.Tool.MOP) {
      return me._processMopClick(pos);
    }
  }

  _processHandClick(pos) {
    const me = this;

    const bodies = Here._.physics.overlapCirc(pos.x, pos.y, 5, true, true);

    for (let i = 0; i < bodies.length; ++i) {
      const gameObj = bodies[i].gameObject;
      if (!gameObj.isGarbage) continue;

      me._garbage.removeGarbage(gameObj);
      const isFull = me._addGarbage();
      if (isFull) {
        me._garbage.createBag(pos.x, pos.y);
      }
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

      if (bucket.dirt === Config.Tools.MaxBucketDirt) bucket.setFrame(5);
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

  _addGarbage() {
    const me = this;

    me._bagGarbageCount += 1;
    if (me._bagGarbageCount < Config.Tools.MaxGarbageCountAtBag) {
      return false;
    }

    me._bagGarbageCount = 0;
    return true;
  }
}
