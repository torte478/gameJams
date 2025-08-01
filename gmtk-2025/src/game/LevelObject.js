import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";
import ItemConfig from "./ItemConfig.js";
import Player from "./Player.js";

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

  /** @type {Number} */
  _type;

  /**
   *
   * @param {Number} type
   * @param {ItemConfig} config
   */
  constructor(type, config) {
    const me = this;

    me._type = type;
    me._tileX = config.tileX;
    me._tileY = config.tileY;
    me._bitsToActive = config.bits;

    if (me._type == Enums.LevelObjectTypes.SPIKES) {
      me._sprite = Here._.add.sprite(
        me._tileX * Consts.Unit.Normal + 0.5 * Consts.Unit.Normal,
        me._tileY * Consts.Unit.Normal,
        "spikes",
        0
      );
    } else if (me._type == Enums.LevelObjectTypes.GUN) {
      me._sprite = Here._.add.sprite(
        me._tileX * Consts.Unit.Normal + 0.5 * Consts.Unit.Normal,
        me._tileY * Consts.Unit.Normal + 0.5 * Consts.Unit.Normal,
        "gun",
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

  /**
   * @param {Number} playerTileX
   * @param {Number} playerTileY
   * @param {Phaser.Tilemaps.TilemapLayer} tilemapLayer
   * @param {Player} player
   * @returns {Boolean}
   */
  checkPlayer(playerTileX, playerTileY, tilemapLayer, player) {
    const me = this;

    if (!me._isActive) return false;

    if (me._type == Enums.LevelObjectTypes.SPIKES) {
      return playerTileX === me._tileX && playerTileY === me._tileY - 1;
    }
    if (me._type == Enums.LevelObjectTypes.GUN) {
      return me._checkGunHit(playerTileX, playerTileY, tilemapLayer, player);
    } else {
      throw "error";
    }

    return false;
  }

  /**
   * @param {Number} playerTileX
   * @param {Number} playerTileY
   * @param {Phaser.Tilemaps.TilemapLayer} tilemapLayer
   * @param {Player} player
   * @returns {Boolean}
   */
  _checkGunHit(playerTileX, playerTileY, tilemapLayer, player) {
    const me = this;

    if (me._tileY != playerTileY) return false;

    for (let currentX = me._tileX - 1; currentX >= 0; --currentX) {
      const tile = tilemapLayer.getTileAt(currentX, me._tileY);
      if (!!tile && tile.index > 0) return false;

      if (currentX == playerTileX)
        return !player.isShield || player.direction == -1;
    }

    return false;
  }
}
