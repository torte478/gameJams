import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";
import ItemConfig from "./ItemConfig.js";
import World from "./World.js";

export default class LevelObject {
  /** @type {Phaser.GameObjects.Sprite} */
  sprite;

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
   * @param {Phaser.GameObjects.Group} pool
   */
  constructor(type, config, pool, startTileX) {
    const me = this;

    me._type = type;
    me._tileX = startTileX + config.tileX;
    me._tileY = config.tileY;
    me._bitsToActive = config.bits;

    if (me._type == Enums.LevelObjectTypes.SPIKES) {
      me.sprite = pool.get();
      me.sprite
        .setPosition(
          me._tileX * Consts.Unit.Normal + 0.5 * Consts.Unit.Normal,
          me._tileY * Consts.Unit.Normal
        )
        .setTexture("spikes", 0)
        .setVisible(true)
        .setActive(true);
    } else if (me._type == Enums.LevelObjectTypes.GUN) {
      me.sprite = pool.get();
      me.sprite
        .setPosition(
          me._tileX * Consts.Unit.Normal + 0.5 * Consts.Unit.Normal,
          me._tileY * Consts.Unit.Normal + 0.5 * Consts.Unit.Normal
        )
        .setTexture("gun", 0)
        .setVisible(true)
        .setActive(true);
    } else if (me._type == Enums.LevelObjectTypes.TRAMPOLINE) {
      me.sprite = pool.get();
      me.sprite
        .setPosition(
          me._tileX * Consts.Unit.Normal + 0.5 * Consts.Unit.Normal,
          me._tileY * Consts.Unit.Normal
        )
        .setTexture("trampoline", 0)
        .setVisible(true)
        .setActive(true);
    } else if (me._type == Enums.LevelObjectTypes.GOOD_BARREL) {
      me.sprite = pool.get();
      me.sprite
        .setPosition(
          me._tileX * Consts.Unit.Normal + 0.5 * Consts.Unit.Normal,
          me._tileY * Consts.Unit.Normal + 0.5 * Consts.Unit.Normal
        )
        .setTexture("barrels", 0)
        .setVisible(true)
        .setActive(true);
      me._isActive = true;
    } else if (me._type == Enums.LevelObjectTypes.BAD_BARREL) {
      me.sprite = pool.get();
      me.sprite
        .setPosition(
          me._tileX * Consts.Unit.Normal + 0.5 * Consts.Unit.Normal,
          me._tileY * Consts.Unit.Normal + 0.5 * Consts.Unit.Normal
        )
        .setTexture("barrels", 1)
        .setVisible(true)
        .setActive(true);
      me._isActive = true;
    } else if (me._type == Enums.LevelObjectTypes.TEMP_PLATFORM) {
      me.sprite = pool.get();
      me.sprite
        .setPosition(
          me._tileX * Consts.Unit.Normal + 0.5 * Consts.Unit.Normal,
          me._tileY * Consts.Unit.Normal + 0.5 * Consts.Unit.Normal
        )
        .setTexture("temp_platform", 1)
        .setVisible(true)
        .setActive(true);
      me._isActive = true;
    } else {
      throw "error";
    }

    me.update(0);
  }

  update(currentBit) {
    const me = this;

    if (!!me._bitsToActive) {
      me._isActive = Utils.any(me._bitsToActive, (bit) => bit === currentBit);
      me.sprite.setFrame(me._isActive ? 1 : 0);
    }
  }

  /**
   * @param {World} world
   * @returns {Boolean}
   */
  checkPlayer(world) {
    const me = this;

    if (!me._isActive) return false;

    if (me._type == Enums.LevelObjectTypes.SPIKES) {
      return (
        world.playerTilePos.x === me._tileX &&
        world.playerTilePos.y === me._tileY - 1
      );
    } else if (me._type == Enums.LevelObjectTypes.GUN) {
      return me._checkGunHit(world);
    } else if (me._type == Enums.LevelObjectTypes.TRAMPOLINE) {
      return (
        world.playerTilePos.x == me._tileX &&
        (world.playerTilePos.y == me._tileY ||
          world.playerTilePos.y == me._tileY - 1)
      );
    } else if (me._type == Enums.LevelObjectTypes.TEMP_PLATFORM) {
      if (
        world.playerTilePos.x == me._tileX &&
        world.playerTilePos.y == me._tileY - 1
      ) {
        me._isActive = false;
        me.sprite.setVisible(false);
      }
    } else {
      throw "error";
    }
  }

  explode() {
    const me = this;

    const canExplode =
      (me._type == Enums.LevelObjectTypes.GOOD_BARREL ||
        me._type == Enums.LevelObjectTypes.BAD_BARREL) &&
      me._isActive;
    if (!canExplode) throw "error";

    me._isActive = false;
    me.sprite.setVisible(false);
  }

  restoreBarrel() {
    const me = this;

    const canRestore =
      (me._type == Enums.LevelObjectTypes.GOOD_BARREL ||
        me._type == Enums.LevelObjectTypes.BAD_BARREL) &&
      !me._isActive;

    if (!canRestore) return;

    me._isActive = true;
    me.sprite.setVisible(true);
  }

  restoreTempPlatform() {
    const me = this;

    const canRestore = !me._isActive;

    if (!canRestore) return;

    me._isActive = true;
    me.sprite.setVisible(true);
  }

  /**
   * @param {World} world
   * @returns {Boolean}
   */
  _checkGunHit(world) {
    const me = this;

    if (me._tileY != world.playerTilePos.y) return false;

    for (let currentX = me._tileX - 1; currentX >= 0; --currentX) {
      if (world.isSolidTile(currentX, me._tileY)) return false;

      if (currentX == world.playerTilePos.x)
        return !world.player.isShield || world.player.direction == -1;
    }

    return false;
  }
}
