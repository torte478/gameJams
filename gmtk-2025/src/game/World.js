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
  player;

  /** @type {Phaser.Math.Vector2} */
  playerTilePos;

  /** @type {Phaser.Tilemaps.TilemapLayer} */
  _tilemapLayer;

  _isReset = false;

  /** @type {LevelObject[]}*/
  _spikes;

  /** @type {LevelObject[]} */
  _guns;

  /** @type {LevelObject[]} */
  _trampolines;

  /** @type {LevelConfig} */
  _levelConfig;

  /** @type {Boolean} */
  _isPlayerFalling;

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
    me._trampolines = me._createLevelObjects(
      Enums.LevelObjectTypes.TRAMPOLINE,
      me._levelConfig.trampolins
    );

    me.player = new Player();
    me._isPlayerFalling = false;

    me.reset();
  }

  applyBitChange(commands, currentBit) {
    const me = this;

    let isDeath = false;

    if (!me.player.isDead) me._doPlayerActions(commands);

    me._updateObjectItems(me._spikes, currentBit);
    me._updateObjectItems(me._guns, currentBit);
    me._updateObjectItems(me._trampolines, currentBit);

    if (!me.player.isDead) {
      for (let i = 0; i < me._trampolines.length; ++i) {
        const trampoline = me._trampolines[i];
        if (trampoline.checkPlayer(me)) {
          const newPlayerTilePos = {
            x: me.playerTilePos.x,
            y: me.playerTilePos.y - 2,
          };
          me._movePlayerPosTo(newPlayerTilePos);
          break;
        }
      }

      for (let i = 0; i < me._spikes.length; ++i) {
        if (me._spikes[i].checkPlayer(me)) {
          me.player.die();
          isDeath = true;
        }
      }

      for (let i = 0; i < me._guns.length; ++i) {
        if (me._guns[i].checkPlayer(me)) {
          me.player.die();
          isDeath = true;
        }
      }
    }

    return isDeath;
  }

  reset() {
    const me = this;

    me._isReset = true;

    me._movePlayerPosTo(me._levelConfig.startTilePos);
    me.player.reset();
  }

  isSolidTile(tileX, tileY) {
    const me = this;
    const tile = me._tilemapLayer.getTileAt(tileX, tileY);

    return !!tile && tile.index > 0;
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

  _updateObjectItems(items, currentBit) {
    const me = this;

    for (let i = 0; i < items.length; ++i) {
      items[i].update(currentBit);
    }
  }

  _doPlayerActions(commands) {
    const me = this;

    if (me._isPlayerFalling) {
      me._movePlayerPosTo({ x: me.playerTilePos.x, y: me.playerTilePos.y + 1 });
    }

    if (Utils.all(commands, (c) => !c)) {
      me.player.toIdle();
    }

    if (commands[Enums.SampleCommands.WALK]) {
      me._applyWalkCommand();
    }

    if (commands[Enums.SampleCommands.TURN]) {
      me.player.turn();
    }

    if (commands[Enums.SampleCommands.SHIELD]) {
      me.player.toShield();
    }

    if (commands[Enums.SampleCommands.ATTACK]) {
      me.player.toAttack();
    }

    me._isPlayerFalling = !me.isSolidTile(
      me.playerTilePos.x,
      me.playerTilePos.y + 1
    );
  }

  _applyWalkCommand() {
    const me = this;

    if (me._isPlayerFalling) return;

    me.player.toIdle();

    const forwardTilePos = {
      x: me.playerTilePos.x + me.player.direction,
      y: me.playerTilePos.y,
    };

    if (me.isSolidTile(forwardTilePos.x, forwardTilePos.y)) return; // TODO: trampoline!

    me._movePlayerPosTo(forwardTilePos);
  }

  _movePlayerPosTo(newPos) {
    const me = this;

    me.playerTilePos = newPos;
    const pos = me._getTileCenter(me.playerTilePos.x, me.playerTilePos.y);
    me.player.toGameObject().setPosition(pos.x, pos.y);
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
