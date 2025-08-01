import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Config from "./Config.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";
import LevelConfig from "./LevelConfig.js";
import Player from "./Player.js";
import LevelObject from "./LevelObject.js";
import { LevelContainer } from "./LevelContainer.js";

export default class World {
  /** @type {Player} */
  player;

  /** @type {Phaser.Math.Vector2} */
  playerTilePos;

  /** @type {Phaser.Tilemaps.TilemapLayer} */
  _tilemapLayer;

  _isReset = false;

  /** @type {LevelConfig} */
  _levelConfig;

  /** @type {Boolean} */
  _isPlayerFalling;

  /** @type {LevelContainer} */
  _mainLevelContainer;

  /** @type {LevelContainer} */
  _secondaryLevelContainer;

  constructor() {
    const me = this;

    const spritePool = Here._.add.group();
    me._mainLevelContainer = new LevelContainer(spritePool);
    me._secondaryLevelContainer = new LevelContainer(spritePool);

    me._levelConfig = Utils.firstOrNull(
      Config.Levels,
      (c) => c.name == Config.LevelOrder[0]
    );

    me.player = new Player();

    me._mainLevelContainer.init(me._levelConfig);

    me.reset();
  }

  applyBitChange(commands, currentBit) {
    const me = this;

    if (!me.player.isDead) me._doPlayerActions(commands);

    me._mainLevelContainer.update(currentBit);

    if (me.player.isDead) return Enums.BitResult.NONE;

    // win
    if (
      me.playerTilePos.x == me._levelConfig.finishTilePos.x &&
      me.playerTilePos.y == me._levelConfig.finishTilePos.y
    ) {
      return Enums.BitResult.WIN;
    }

    // trampolines
    for (let i = 0; i < me._mainLevelContainer.trampolines.length; ++i) {
      const trampoline = me._mainLevelContainer.trampolines[i];
      if (trampoline.checkPlayer(me)) {
        const newPlayerTilePos = {
          x: me.playerTilePos.x,
          y: me.playerTilePos.y - 2,
        };
        me._movePlayerPosTo(newPlayerTilePos);
        break;
      }
    }

    // spikes
    for (let i = 0; i < me._mainLevelContainer.spikes.length; ++i) {
      if (me._mainLevelContainer.spikes[i].checkPlayer(me)) {
        me.player.die();
        return Enums.BitResult.DEATH;
      }
    }

    // guns
    for (let i = 0; i < me._mainLevelContainer.guns.length; ++i) {
      if (me._mainLevelContainer.guns[i].checkPlayer(me)) {
        me.player.die();
        return Enums.BitResult.DEATH;
      }
    }

    return Enums.BitResult.NONE;
  }

  reset() {
    const me = this;

    me._isReset = true;

    me._movePlayerPosTo(me._levelConfig.startTilePos);
    me.player.reset();
    me._isPlayerFalling = false;
  }

  isSolidTile(tileX, tileY) {
    const me = this;

    return me._mainLevelContainer.isSolidTile(tileX, tileY);
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

    return {
      x: tileX * Consts.Unit.Normal + Consts.Unit.Normal / 2,
      y: tileY * Consts.Unit.Normal + Consts.Unit.Normal / 2,
    };
  }
}
