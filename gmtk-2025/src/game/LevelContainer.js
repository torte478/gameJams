import Here from "../framework/Here.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";
import LevelConfig from "./LevelConfig.js";
import LevelObject from "./LevelObject.js";

export default class LevelContainer {
  /** @type {LevelObject[]}*/
  spikes = [];

  /** @type {LevelObject[]} */
  guns = [];

  /** @type {LevelObject[]} */
  trampolines = [];

  /** @type {LevelObject[]} */
  goodBarrels = [];

  /** @type {LevelObject[]} */
  badBarrels = [];

  /** @type {Phaser.GameObjects.Sprite} */
  _finishFlag;

  /** @type {Phaser.GameObjects.Group} */
  _spritePool;

  /** @type {Number} */
  _startTileX;

  /** @type {Number} */
  widthAtTiles = 0;

  constructor(spritePool) {
    const me = this;

    me._spritePool = spritePool;
  }

  /**
   * @param {LevelConfig} levelConfig
   * @param {Phaser.Tilemaps.Tilemap} tilemap
   * @param {Number} startTileX
   */
  init(levelConfig, tilemap, startTileX) {
    const me = this;

    me._clear();

    me._startTileX = startTileX;

    const copyFrom = startTileX == 0 ? 0 : Consts.LevelOverlayAtTiles;

    const tempMap = Here._.add.tilemap(levelConfig.name);
    for (let tileX = copyFrom; tileX < tempMap.width; ++tileX)
      for (let tileY = 0; tileY < tempMap.height; ++tileY) {
        const tile = tempMap.getTileAt(tileX, tileY);
        tilemap.putTileAt(tile, me._startTileX + tileX, tileY);
      }

    me.widthAtTiles = tempMap.width; // - copyFrom;

    me.spikes = me._createLevelObjects(
      Enums.LevelObjectTypes.SPIKES,
      levelConfig.spikes
    );
    me.guns = me._createLevelObjects(
      Enums.LevelObjectTypes.GUN,
      levelConfig.guns
    );
    me.trampolines = me._createLevelObjects(
      Enums.LevelObjectTypes.TRAMPOLINE,
      levelConfig.trampolins
    );
    me.goodBarrels = me._createLevelObjects(
      Enums.LevelObjectTypes.GOOD_BARREL,
      levelConfig.goodBarrels
    );
    me.badBarrels = me._createLevelObjects(
      Enums.LevelObjectTypes.BAD_BARREL,
      levelConfig.badBarrels
    );

    me._finishFlag = me._spritePool.get();
    me._finishFlag
      .setPosition(
        startTileX * Consts.Unit.Normal +
          levelConfig.finishTilePos.x * Consts.Unit.Normal +
          0.5 * Consts.Unit.Normal,
        levelConfig.finishTilePos.y * Consts.Unit.Normal +
          0.5 * Consts.Unit.Normal
      )
      .setTexture("finish_flag", 0)
      .setActive(true)
      .setVisible(true);
  }

  update(currentBit) {
    const me = this;

    me._updateObjectItems(me.spikes, currentBit);
    me._updateObjectItems(me.guns, currentBit);
    me._updateObjectItems(me.trampolines, currentBit);
  }

  runFinishFlagAnimation() {
    const me = this;

    me._finishFlag.setVisible(false);
  }

  _updateObjectItems(items, currentBit) {
    const me = this;

    for (let i = 0; i < items.length; ++i) {
      items[i].update(currentBit);
    }
  }

  _createLevelObjects(objectType, configs) {
    const me = this;

    const res = [];

    if (!configs) return res;

    for (let i = 0; i < configs.length; ++i) {
      const itemConfig = configs[i];
      const obj = new LevelObject(
        objectType,
        itemConfig,
        me._spritePool,
        me._startTileX
      );
      res.push(obj);
    }

    return res;
  }

  _clear() {
    const me = this;

    for (let i = 0; i < me.spikes.length; ++i)
      me._spritePool.killAndHide(me.spikes[i].sprite);
    for (let i = 0; i < me.guns.length; ++i)
      me._spritePool.killAndHide(me.guns[i].sprite);
    for (let i = 0; i < me.trampolines.length; ++i)
      me._spritePool.killAndHide(me.trampolines[i].sprite);
    for (let i = 0; i < me.goodBarrels.length; ++i)
      me._spritePool.killAndHide(me.goodBarrels[i].sprite);
    for (let i = 0; i < me.badBarrels.length; ++i)
      me._spritePool.killAndHide(me.badBarrels[i].sprite);

    if (!!me._finishFlag) me._spritePool.killAndHide(me._finishFlag);
  }
}
