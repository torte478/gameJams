import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Config from "./Config.js";
import Consts from "./Consts.js";

export default class Lights {
  /** @type {Phaser.Tilemaps.Tilemap} */
  _tilemap;

  /** @type {Number[][]} */
  _lightMatrix;

  /** @type {Number[][]} */
  _secondLightMatrix;

  /** @type {Phaser.Tilemaps.Tilemap} */
  _worldTilemap;

  /** @type {Phaser.Geom.Point[]} */
  _lightSources = [];

  /**
   * @param {Phaser.Tilemaps.Tilemap} map
   */
  constructor(map) {
    const me = this;

    me._initTileMap(map);
    me._worldTilemap = map;

    me._lightMatrix = Utils.buildMatrix(
      0,
      me._tilemap.width,
      me._tilemap.height
    );
    me._secondLightMatrix = Utils.buildMatrix(
      0,
      me._tilemap.width,
      me._tilemap.height
    );

    // const persistentLight = new Phaser.Geom.Rectangle(5, 5, 5, 5);
    // for (let i = 0; i < persistentLight.height; ++i)
    //   for (let j = 0; j < persistentLight.width; ++j)
    //     me._lightMatrix[i + persistentLight.y][j + persistentLight.x] =
    //       Config.Light.MaxLight;

    me.updateTiles(null);

    // me.addLightSource(5, 10);
  }

  recalculateLights() {
    const me = this;

    for (let i = 0; i < me._lightSources.length; ++i)
      me._recalculateLightSource(
        me._lightSources[i],
        me._lightMatrix,
        Config.Light.MaxLight
      );

    me.updateTiles(null);
  }

  updateTilesWithFireball(firstPos, firstLight, secondPos, secondLight) {
    const me = this;

    Utils.clearMatrix(me._secondLightMatrix, 0);
    const firstTilePos = me._tilemap.worldToTileXY(firstPos.x, firstPos.y);
    me._recalculateLightSource(firstTilePos, me._secondLightMatrix, firstLight);

    if (!!secondPos) {
      const secondTilePos = me._tilemap.worldToTileXY(secondPos.x, secondPos.y);
      me._recalculateLightSource(
        secondTilePos,
        me._secondLightMatrix,
        secondLight
      );
    }

    me.updateTiles(me._secondLightMatrix);
  }

  addLightSource(x, y) {
    const me = this;

    me._lightSources.push(Utils.buildPoint(x, y));
    me.recalculateLights();
  }

  _recalculateLightSource(source, matrix, startLight) {
    const me = this;

    const queue = [{ x: source.x, y: source.y, light: startLight }];
    for (let i = 0; i < queue.length; ++i) {
      const current = queue[i];
      matrix[current.y][current.x] = Math.max(
        current.light,
        matrix[current.y][current.x]
      );

      const nextLight = current.light - 1;
      if (nextLight <= 0) continue;

      const worldPos = me._tilemap.tileToWorldXY(current.x, current.y);
      const worldTile = me._worldTilemap.getTileAtWorldXY(
        worldPos.x,
        worldPos.y,
        true
      );
      if (worldTile.index == 1) continue;

      const neigbours = Utils.getNeighbours(matrix, current.y, current.x);

      for (let j = 0; j < neigbours.length; ++j) {
        const next = neigbours[j];
        if (Utils.all(queue, (q) => q.x != next.j || q.y != next.i))
          queue.push({ x: next.j, y: next.i, light: nextLight });
      }
    }
  }

  updateTiles(secondMatrix) {
    const me = this;

    for (let i = 0; i < me._lightMatrix.length; ++i)
      for (let j = 0; j < me._lightMatrix[i].length; ++j) {
        const lightValue =
          me._lightMatrix[i][j] + (!!secondMatrix ? secondMatrix[i][j] : 0);
        const alpha = me._lightValueToAlpha(lightValue);
        me._tilemap.getTileAt(j, i).setAlpha(alpha);
      }
  }

  _initTileMap(map) {
    const me = this;

    const levelMatrix = Utils.buildMatrix(0, map.width * 2, map.height * 2);

    me._tilemap = Here._.make.tilemap({
      tileWidth: Consts.Unit.Normal,
      tileHeight: Consts.Unit.Normal,
      data: levelMatrix,
    });

    const tiles = me._tilemap.addTilesetImage("dark");
    const layer = me._tilemap
      .createLayer(0, tiles, 0, 0)
      .setDepth(Consts.Depth.Ligths);
  }

  _lightValueToAlpha(value) {
    const me = this;

    if (value >= Config.Light.MaxLight) return 0;
    if (value <= 0) return Config.Light.MaxAlpha;

    return Config.Light.MaxAlpha - value / Config.Light.MaxLight;
  }
}
