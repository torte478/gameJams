import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Consts from "./Consts.js";

export default class Spikes {
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

  constructor(tileX, tileY, bitsToActive) {
    const me = this;

    me._tileX = tileX;
    me._tileY = tileY;
    me._bitsToActive = bitsToActive;

    me._sprite = Here._.add.sprite(
      tileX * Consts.Unit.Normal + 0.5 * Consts.Unit.Normal,
      tileY * Consts.Unit.Normal,
      "spikes",
      0
    );

    me.update(0);
  }

  update(currentBit) {
    const me = this;

    me._isActive = Utils.any(me._bitsToActive, (bit) => bit === currentBit);
    me._sprite.setFrame(me._isActive ? 1 : 0);
  }

  isHitOn(tileX, tileY) {
    const me = this;

    return me._isActive && tileX === me._tileX && tileY === me._tileY - 1;
  }
}
