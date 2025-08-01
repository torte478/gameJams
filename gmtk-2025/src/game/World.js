import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Config from "./Config.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";
import LevelConfig from "./LevelConfig.js";
import Player from "./Player.js";
import LevelObject from "./LevelObject.js";

export default class World {
  /** @type {Player} */
  _player;

  /** @type {Phaser.Math.Vector2} */
  _playerTilePos;

  /** @type {Phaser.Tilemaps.TilemapLayer} */
  _tilemapLayer;

  _isReset = false;

  /** @type {LevelObject[]}*/
  _spikes;

  /** @type {LevelObject[]} */
  _guns;

  /** @type {LevelConfig} */
  _levelConfig;

  constructor(levelConfig) {
    const me = this;

    me._levelConfig = levelConfig;

    const map = Here._.add.tilemap(
      me._levelConfig.name,
      Consts.Unit.Normal,
      Consts.Unit.Normal
    );
    const tileset = map.addTilesetImage("tiles");
    me._tilemapLayer = map.createLayer(0, tileset, 0, 0);

    me._spikes = me._createLevelObjects(
      Enums.LevelObjectTypes.SPIKES,
      me._levelConfig.spikes
    );
    me._guns = me._createLevelObjects(
      Enums.LevelObjectTypes.GUN,
      me._levelConfig.guns
    );

    me._player = new Player();

    me.reset();
  }

  _createLevelObjects(objectType, configs) {
    const me = this;

    const res = [];

    if (!configs) return res;

    for (let i = 0; i < configs.length; ++i) {
      const itemConfig = configs[i];
      res.push(new LevelObject(objectType, itemConfig));
    }

    return res;
  }

  applyBitChange(commands, currentBit) {
    const me = this;

    let isDeath = false;

    if (!me._player.isDead) me._doPlayerActions(commands);

    me._updateObjectItems(me._spikes, currentBit);
    me._updateObjectItems(me._guns, currentBit);

    if (!me._player.isDead) {
      for (let i = 0; i < me._spikes.length; ++i) {
        if (
          me._spikes[i].checkPlayer(
            me._playerTilePos.x,
            me._playerTilePos.y,
            me._tilemapLayer,
            me._player
          )
        ) {
          me._player.die();
          isDeath = true;
        }
      }

      for (let i = 0; i < me._guns.length; ++i) {
        if (
          me._guns[i].checkPlayer(
            me._playerTilePos.x,
            me._playerTilePos.y,
            me._tilemapLayer,
            me._player
          )
        ) {
          me._player.die();
          isDeath = true;
        }
      }
    }

    return isDeath;
  }

  _updateObjectItems(items, currentBit) {
    const me = this;

    for (let i = 0; i < items.length; ++i) {
      items[i].update(currentBit);
    }
  }

  _doPlayerActions(commands) {
    const me = this;

    if (Utils.all(commands, (c) => !c)) return me._player.toIdle();

    if (commands[Enums.SampleCommands.WALK]) return me._applyWalkCommand();

    if (commands[Enums.SampleCommands.TURN]) return me._player.turn();

    if (commands[Enums.SampleCommands.SHIELD]) return me._player.toShield();

    if (commands[Enums.SampleCommands.ATTACK]) return me._player.toAttack();
  }

  reset() {
    const me = this;

    me._isReset = true;

    me._playerTilePos = me._levelConfig.startTilePos;
    const pos = me._getTileCenter(me._playerTilePos.x, me._playerTilePos.y);
    me._player.toGameObject().setPosition(pos.x, pos.y);
    me._player.reset();
  }

  _applyWalkCommand() {
    const me = this;

    me._player.toIdle();

    const forwardTilePos = {
      x: me._playerTilePos.x + me._player.direction,
      y: me._playerTilePos.y,
    };
    const forwardTile = me._tilemapLayer.getTileAt(
      forwardTilePos.x,
      forwardTilePos.y
    );
    // TODO: solid tiles
    if (!forwardTile || forwardTile.index === 1) return;
    me._playerTilePos = forwardTilePos;
    const pos = me._getTileCenter(me._playerTilePos.x, me._playerTilePos.y);
    me._player.toGameObject().setPosition(pos.x, pos.y);
  }

  _getTileCenter(tileX, tileY) {
    const me = this;

    const pos = me._tilemapLayer.tileToWorldXY(tileX, tileY);
    return {
      x: pos.x + Consts.Unit.Normal / 2,
      y: pos.y + Consts.Unit.Normal / 2,
    };
  }
}
