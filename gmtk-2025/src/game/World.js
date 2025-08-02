import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Config from "./Config.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";
import LevelConfig from "./LevelConfig.js";
import Player from "./Player.js";
import LevelContainer from "./LevelContainer.js";

export default class World {
  /** @type {Player} */
  player;

  /** @type {Phaser.Math.Vector2} */
  playerTilePos;

  /** @type {Phaser.Tilemaps.Tilemap} */
  _tilemap;

  /** @type {Phaser.Tilemaps.TilemapLayer} */
  _tilemapLayer;

  /** @type {LevelConfig} */
  _levelConfig;

  /** @type {Boolean} */
  _isPlayerFalling;

  /** @type {LevelContainer} */
  _mainLevelContainer;

  /** @type {LevelContainer} */
  _secondaryLevelContainer;

  /** @type {Boolean} */
  _isBusy = false;

  /** @type {Number} */
  _currentLevelTileX = 0;

  /** @type {Phaser.GameObjects.Sprite} */
  _phantomDeath;

  /** @type {Boolean} */
  _runWithNextLoop = false;

  /** @type {Boolean} */
  completeLevelTransition = true;

  constructor() {
    const me = this;

    const tilemapHeight = 10;
    const averageLevelWidth = 20;

    const tilemapMock = [];
    for (let i = 0; i < tilemapHeight; ++i)
      tilemapMock.push(Utils.buildArray(averageLevelWidth * 20, -1));

    me._tilemap = Here._.add.tilemap(
      null,
      Consts.Unit.Normal,
      Consts.Unit.Normal,
      20 * 20,
      10,
      tilemapMock
    );

    const tileset = me._tilemap.addTilesetImage("tiles");

    me._tilemapLayer = me._tilemap.createLayer(0, tileset, 0, 0);

    me._tilemapLayer.setDepth(Consts.Depth.Tiles);

    const spritePool = Here._.add.group();
    me._mainLevelContainer = new LevelContainer(spritePool);
    me._secondaryLevelContainer = new LevelContainer(spritePool);

    me._levelConfig = Utils.firstOrNull(
      Config.Levels,
      (c) => c.name == Config.LevelOrder[0]
    );

    me.player = new Player();

    me._phantomDeath = Here._.add
      .sprite(0, 0, "player", 3)
      .setAlpha(0.5)
      .setDepth(Consts.Depth.Overlay)
      .setVisible(false);

    me._mainLevelContainer.init(me._levelConfig, me._tilemap, 0);

    me.resetCurrentLevel();
  }

  update(commands, currentBit, gameState, isNewBit) {
    const me = this;

    if (me._isBusy) return;

    if (me._runWithNextLoop && currentBit == 0 && isNewBit) {
      me._runWithNextLoop = false;
    }

    if (
      gameState == Enums.GameStates.PLAY &&
      !me._runWithNextLoop &&
      !!commands
    )
      me._doPlayerActions(commands);

    me._mainLevelContainer.update(currentBit);

    if (gameState !== Enums.GameStates.PLAY) return Enums.BitResult.NONE;

    // win
    if (
      me.playerTilePos.x ==
        me._currentLevelTileX + me._levelConfig.finishTilePos.x &&
      me.playerTilePos.y == me._levelConfig.finishTilePos.y
    ) {
      me._mainLevelContainer.runFinishFlagAnimation();
      return Enums.BitResult.WIN;
    }

    return me._updateLevelObjects(gameState);
  }

  isInsideView(pos) {
    const me = this;

    const camera = Here._.cameras.main;

    return (
      pos.x >= camera.scrollX &&
      pos.x <= camera.scrollX + camera.width &&
      pos.y >= camera.scrollY &&
      pos.y <= camera.scrollY + camera.height
    );
  }

  gotoNextLevel(nextLevelConfig) {
    const me = this;

    me._isBusy = true;
    me.completeLevelTransition = false;

    me._currentLevelTileX +=
      me._mainLevelContainer.widthAtTiles - Consts.LevelOverlayAtTiles;
    me._secondaryLevelContainer.init(
      nextLevelConfig,
      me._tilemap,
      me._currentLevelTileX
    );

    const camera = Here._.cameras.main;
    Here._.tweens.addCounter({
      from: camera.scrollX,
      to:
        camera.scrollX +
        Consts.Viewport.Width -
        Consts.LevelOverlayAtTiles * Consts.Unit.Normal,
      duration: Config.DurationMs.LevelChange,
      onUpdate: (tween) => {
        camera.setScroll(tween.getValue(), 0);
      },
      onComplete: () => {
        const t = me._secondaryLevelContainer;
        me._secondaryLevelContainer = me._mainLevelContainer;
        me._mainLevelContainer = t;
        me._levelConfig = nextLevelConfig;

        me._isBusy = false;
        me.completeLevelTransition = true;
      },
    });
  }

  resetCurrentLevel() {
    const me = this;

    me._movePlayerPosTo({
      x: me._currentLevelTileX + me._levelConfig.startTilePos.x,
      y: me._levelConfig.startTilePos.y,
    });
    me.player.reset();
    me._isPlayerFalling = false;

    // TODO: learn foreach for god sake
    for (let i = 0; i < me._mainLevelContainer.goodBarrels.length; ++i)
      me._mainLevelContainer.goodBarrels[i].restore();
    for (let i = 0; i < me._mainLevelContainer.badBarrels.length; ++i)
      me._mainLevelContainer.badBarrels[i].restore();
  }

  isSolidTile(tileX, tileY) {
    const me = this;

    const barrel = me._findBarrelAtPosition(tileX, tileY);
    if (!!barrel) return true;

    const tile = me._tilemapLayer.getTileAt(tileX, tileY);

    return !tile || tile.index > 0;
  }

  runWithNextLoop() {
    const me = this;

    me._runWithNextLoop = true;
  }

  _updateLevelObjects(gameState) {
    const me = this;

    if (gameState != Enums.GameStates.PLAY || me._runWithNextLoop)
      return Enums.BitResult.NONE;

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
        return me._processDeath();
      }
    }

    // guns
    for (let i = 0; i < me._mainLevelContainer.guns.length; ++i) {
      if (me._mainLevelContainer.guns[i].checkPlayer(me)) {
        return me._processDeath();
      }
    }

    return Enums.BitResult.NONE;
  }

  _processDeath() {
    const me = this;

    const playerObj = me.player.toGameObject();
    me._phantomDeath.setPosition(playerObj.x, playerObj.y).setVisible(true);

    me.resetCurrentLevel();
    return Enums.BitResult.DEATH;
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

      const forwardTileX = me.playerTilePos.x + me.player.direction;
      const firstBarrel = me._findBarrelAtPosition(
        forwardTileX,
        me.playerTilePos.y
      );
      const secondBarrel = me._findBarrelAtPosition(
        forwardTileX,
        me.playerTilePos.y - 1
      );

      let isPlayerDeath = false;
      if (!!firstBarrel) {
        firstBarrel.explode();
        if (firstBarrel._type == Enums.LevelObjectTypes.BAD_BARREL)
          isPlayerDeath = true;
      }
      if (!!secondBarrel) {
        secondBarrel.explode();
        if (secondBarrel._type == Enums.LevelObjectTypes.BAD_BARREL)
          isPlayerDeath = true;
      }

      if (isPlayerDeath) return me._processDeath();
    }

    me._isPlayerFalling = !me.isSolidTile(
      me.playerTilePos.x,
      me.playerTilePos.y + 1
    );
  }

  _findBarrelAtPosition(tileX, tileY) {
    const me = this;
    for (let i = 0; i < me._mainLevelContainer.goodBarrels.length; ++i) {
      const goodBarrel = me._mainLevelContainer.goodBarrels[i];
      if (
        goodBarrel._tileX == tileX &&
        goodBarrel._tileY == tileY &&
        goodBarrel._isActive
      )
        return goodBarrel;
    }

    for (let i = 0; i < me._mainLevelContainer.badBarrels.length; ++i) {
      const badBarrel = me._mainLevelContainer.badBarrels[i];
      if (
        badBarrel._tileX == tileX &&
        badBarrel._tileY == tileY &&
        badBarrel._isActive
      )
        return badBarrel;
    }

    return null;
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
