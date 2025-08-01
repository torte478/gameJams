import Here from "../framework/Here.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";
import LevelObject from "./LevelObject.js";

export class LevelContainer {
  /** @type {Phaser.GameObjects.Container} */
  _container;

  /** @type {Phaser.Tilemaps.Tilemap} */
  _tilemap;

  /** @type {Phaser.Tilemaps.TilemapLayer} */
  _tilemapLayer;

  /** @type {LevelObject[]}*/
  spikes = [];

  /** @type {LevelObject[]} */
  guns = [];

  /** @type {LevelObject[]} */
  trampolines = [];

  /** @type {Phaser.GameObjects.Sprite} */
  _finishFlag;

  /** @type {Phaser.GameObjects.Group} */
  _spritePool;

  constructor(spritePool) {
    const me = this;

    me._spritePool = spritePool;

    me._tilemap = Here._.add.tilemap(
      "test_level", // TODO: name
      Consts.Unit.Normal,
      Consts.Unit.Normal,
      20,
      10
    );

    const tileset = me._tilemap.addTilesetImage("tiles");

    me._tilemapLayer = me._tilemap.createLayer(0, tileset, 0, 0);

    me._tilemapLayer.setDepth(Consts.Depth.Tiles);

    me._container = Here._.add.container(0, 0, [me._tilemapLayer]);
  }

  toObj() {
    const me = this;

    return me._container;
  }

  /**
   * @param {LevelConfig} levelConfig
   */
  init(levelConfig) {
    const me = this;

    me._clear();

    const tempMap = Here._.add.tilemap(levelConfig.name);
    for (let tileX = 0; tileX < tempMap.width; ++tileX)
      for (let tileY = 0; tileY < tempMap.height; ++tileY)
        me._tilemap.putTileAt(tempMap.getTileAt(tileX, tileY), tileX, tileY);

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

    me._finishFlag = me._spritePool.get(
      levelConfig.finishTilePos.x * Consts.Unit.Normal +
        0.5 * Consts.Unit.Normal,
      levelConfig.finishTilePos.y * Consts.Unit.Normal +
        0.5 * Consts.Unit.Normal,
      "finish_flag",
      0
    );
  }

  update(currentBit) {
    const me = this;

    me._updateObjectItems(me.spikes, currentBit);
    me._updateObjectItems(me.guns, currentBit);
    me._updateObjectItems(me.trampolines, currentBit);
  }

  isSolidTile(tileX, tileY) {
    const me = this;
    const tile = me._tilemapLayer.getTileAt(tileX, tileY);

    return !tile || tile.index > 0;
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
      const obj = new LevelObject(objectType, itemConfig, me._spritePool);
      res.push(obj);
      me._container.add(obj);
    }

    return res;
  }

  _clear() {
    const me = this;

    for (let tileY = 0; tileY < me._tilemap.height; ++tileY)
      for (let tileX = 0; tileX < me._tilemap.width; ++tileX)
        me._tilemap.putTileAt(-1, tileX, tileY);

    for (let i = 0; i < me.spikes.length; ++i)
      me._spritePool.killAndHide(me.spikes[i].sprite);
    for (let i = 0; i < me.guns.length; ++i)
      me._spritePool.killAndHide(me.guns[i].sprite);
    for (let i = 0; i < me.trampolines.length; ++i)
      me._spritePool.killAndHide(me.trampolines[i].sprite);

    if (!!me._finishFlag) me._spritePool.killAndHide(me._finishFlag);

    me._container.removeAll().add(me._tilemapLayer);
  }
}
