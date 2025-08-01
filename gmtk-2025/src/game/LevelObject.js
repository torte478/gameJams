import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";

export default class LevelObject {
  /** @type {Phaser.GameObjects.Sprite} */
  _sprite;

  /** @type {Number} */
  _tileX;

  /** @type {Number} */
  _tileY;

  /** @type {Number[]} */
  _bitsToActive;

  /** @type {Boolean} */
  _isActive;

  _type;

  constructor(type, tileX, tileY, bitsToActive) {
    const me = this;

    me._type = type;
    me._tileX = tileX;
    me._tileY = tileY;
    me._bitsToActive = bitsToActive;

    if (me._type == Enums.LevelObjectTypes.SPIKES) {
      me._sprite = Here._.add.sprite(
        tileX * Consts.Unit.Normal + 0.5 * Consts.Unit.Normal,
        tileY * Consts.Unit.Normal,
        "spikes",
        0
      );
    } else {
      throw "error";
    }

    me.update(0);
  }

  update(currentBit) {
    const me = this;

    me._isActive = Utils.any(me._bitsToActive, (bit) => bit === currentBit);
    me._sprite.setFrame(me._isActive ? 1 : 0);
  }

  checkPlayer(tileX, tileY) {
    const me = this;

    if (me._type == Enums.LevelObjectTypes.SPIKES) {
      return me._isActive && tileX === me._tileX && tileY === me._tileY - 1;
    } else {
      throw "error";
    }
  }
}
