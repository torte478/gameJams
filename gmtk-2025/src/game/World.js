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

  /** @type {Phaser.GameObjects.Image} */
  _fade;

  /** @type {Phaser.GameObjects.Image} */
  _dragonHead;

  /** @type {Phaser.GameObjects.Image} */
  _dragonTextPointer;

  /** @type {Phaser.GameObjects.Text} */
  _dragonText;

  /** @type {Boolean} */
  _isDragonHeadShown = false;

  /** @type {Phaser.GameObjects.Particles.ParticleEmitter} */
  _bloodParticles;

  /** @type {Phaser.GameObjects.Image} */
  _dragonTail;

  /** @type {Number} */
  _nextTimeToShowDragonTailMs = 0;

  /** @type {Phaser.Tweens.Tween} */
  _dragonTailTween = null;

  _lastTime = 0;

  _game;

  /** @type {Phaser.GameObjects.Particles.ParticleEmitter} */
  _gunParticles;

  constructor(game) {
    const me = this;
    me._game = game;

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

    me._bloodParticles = Here._.add.particles(0, 0, "particles", {
      frame: [0, 1, 2, 3],
      speed: { min: 150, max: 250 },
      scale: { start: 0.8, end: 0 },
      gravityY: 150,
      blendMode: "ADD",
      emitting: false,
    });

    me._gunParticles = Here._.add.particles(0, 0, "particles", {
      frame: [5],
      speed: { min: 200, max: 250 },
      scale: { start: 0.8, end: 0 },
      gravityY: 150,
      blendMode: "ADD",
      emitting: false,
    });

    me._dragonTail = Here._.add
      .image(0, -300, "dragon_tail")
      .setScale(0.5)
      .setFlipX(true)
      .setInteractive();

    me._dragonTail.canBeClickedByPlayer = true;

    me._dragonTail.on("pointerover", () =>
      me._dragonTail.setTintFill(0xff0000)
    );
    me._dragonTail.on("pointerout", () => me._dragonTail.clearTint());
    me._dragonTail.on("pointerdown", () => me._onDragonTailClick());

    const tileset = me._tilemap.addTilesetImage("tiles");

    me._tilemapLayer = me._tilemap.createLayer(0, tileset, 0, 0);

    me._tilemapLayer.setDepth(Consts.Depth.Tiles);

    const spritePool = Here._.add.group();
    me._mainLevelContainer = new LevelContainer(spritePool, me);
    me._secondaryLevelContainer = new LevelContainer(spritePool, me);

    me._levelConfig = Utils.firstOrNull(
      Config.Levels,
      (c) => c.name == Config.LevelOrder[0]
    );

    me._dragonHead = Here._.add.image(450, -300, "dragon_head");
    me._dragonTextPointer = Here._.add.image(0, -300, "dragon_hint");
    me._dragonText = Here._.add
      .text(580, -300, "TEST TEXT", {
        fontFamily: "Arial Black",
        fontSize: 24,
        color: "#9e557f",
      })
      .setAlign("right")
      .setOrigin(1, 0);

    me.player = new Player();

    me._fade = Here._.add
      .image(0, 0, "fade")
      .setAlpha(0.25)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(Consts.Depth.Fade);

    me._phantomDeath = Here._.add
      .sprite(0, 0, "player", 3)
      .setAlpha(0.5)
      .setDepth(Consts.Depth.Overlay)
      .setVisible(false);

    me._mainLevelContainer.init(me._levelConfig, me._tilemap, 0);
    me._resetNextDragonTailTime();

    me.resetCurrentLevel();

    me._runDragonHead();
  }

  _runDragonHead() {
    const me = this;

    let text = null;
    if (me._levelConfig.name == "walk_tutorial")
      text =
        "Foolish Knight!\n\nDo NOT fill the Drum Kit\nand do NOT press the Play button!";
    if (me._levelConfig.name == "trampoline_tutorial")
      text = "Foolish Knight!\n\nDo NOT click on my tail to get hints!";

    if (text === null) return;

    me._isDragonHeadShown = true;
    me._dragonHead
      .setPosition(me._currentLevelTileX * Consts.Unit.Normal + 850, -150)
      .setAngle(180);
    Here._.tweens.add({
      targets: me._dragonHead,
      y: 150,
      duration: Config.DurationMs.DragonHead,
      ease: "sine.out",
      onComplete: () => {
        me._dragonTextPointer
          .setAngle(30)
          .setPosition(670, 125)
          .setVisible(true);
        me._dragonText.setPosition(600, 80).setText(text).setVisible(true);
      },
    });
  }

  _onDragonTailClick() {
    const me = this;

    if (!me._dragonTail.canBeClickedByPlayer) {
      return;
    }

    if (!!me._dragonTailTween) me._dragonTailTween.stop();

    me._dragonTail.canBeClickedByPlayer = false;
    me._game.processDragonTailClick();

    me._dragonTailTween = Here._.add.tween({
      targets: me._dragonTail,
      x: me._currentLevelTileX * Consts.Unit.Normal - 150,
      duration: Config.DurationMs.DragonTailShowcase / 2,
      onComplete: () => {
        me._dragonTailTween = null;
        me._dragonTail.canBeClickedByPlayer = true;
        me._resetNextDragonTailTime();

        me._dragonTail.clearTint();
      },
    });
  }

  _resetNextDragonTailTime() {
    const me = this;

    me._nextTimeToShowDragonTailMs =
      me._lastTime +
      Utils.getRandom(
        Config.DurationMs.MinDragonTailPeriod,
        Config.DurationMs.MaxDragonTailPeriod,
        Config.DurationMs.MinDragonTailPeriod
      );
  }

  update(commands, currentBit, gameState, isNewBit, time) {
    const me = this;

    me._lastTime = time;

    if (me._isBusy) return;

    // begin dragon tail
    if (
      !me._levelConfig.ignoreDragonTail &&
      !me._dragonTailTween &&
      time > me._nextTimeToShowDragonTailMs
    ) {
      me._resetNextDragonTailTime();

      const startTailPosX = me._currentLevelTileX * Consts.Unit.Normal - 50;
      me._dragonTail.setPosition(startTailPosX, 50);

      me._dragonTailTween = Here._.tweens.add({
        targets: me._dragonTail,
        x: startTailPosX + 150,
        y: 250,
        duration: Config.DurationMs.DragonTailShowcase,
        onComplete: () => {
          me._dragonTailTween = Here._.tweens.add({
            targets: me._dragonTail,
            x: startTailPosX,
            y: 500,
            duration: Config.DurationMs.DragonTailShowcase,
            onComplete: () => {
              me._dragonTailTween = null;

              me._dragonTail.clearTint();
            },
          });
        },
      });
    }
    // end dragon tail

    if (me._runWithNextLoop && currentBit == 0 && isNewBit) {
      me._runWithNextLoop = false;
    }

    if (
      gameState == Enums.GameStates.PLAY &&
      !me._runWithNextLoop &&
      !!commands
    )
      me._doPlayerActions(commands);

    if (!me.player.isShield) me.player._sprite.setFrame(currentBit % 2);

    me._mainLevelContainer.update(currentBit, isNewBit);

    if (isNewBit && gameState == Enums.GameStates.PLAY)
      Utils.debugLog(
        `${currentBit}: x${me.playerTilePos.x} y${me.playerTilePos.y} ${
          me.player.direction == 1 ? "->" : "<-"
        }`
      );

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

  gotoNextLevel(nextLevelConfig, time) {
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

    if (me._isDragonHeadShown) {
      me._isDragonHeadShown = false;
      me._dragonText.setVisible(false);
      me._dragonTextPointer.setVisible(false);
      Here._.add.tween({
        targets: me._dragonHead,
        y: -150,
        duration: Config.DurationMs.DragonHead,
        ease: "sine.in",
      });
    }

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

        me._resetNextDragonTailTime();

        me._runDragonHead();
      },
    });
  }

  resetCurrentLevel() {
    const me = this;

    Utils.debugLog("=====================");

    me._movePlayerPosTo({
      x: me._currentLevelTileX + me._levelConfig.startTilePos.x,
      y: me._levelConfig.startTilePos.y,
    });
    me.player.reset();
    me._isPlayerFalling = false;

    // TODO: learn foreach for god sake
    for (let i = 0; i < me._mainLevelContainer.goodBarrels.length; ++i)
      me._mainLevelContainer.goodBarrels[i].restoreBarrel();
    for (let i = 0; i < me._mainLevelContainer.badBarrels.length; ++i)
      me._mainLevelContainer.badBarrels[i].restoreBarrel();

    for (let i = 0; i < me._mainLevelContainer.tempPlatforms.length; ++i)
      me._mainLevelContainer.tempPlatforms[i].restoreTempPlatform();
  }

  isSolidTile(tileX, tileY) {
    const me = this;

    const barrel = me._findBarrelAtPosition(tileX, tileY);
    if (!!barrel) return true;

    const isTrampoline = me._hasActiveTrampolineAtPos(tileX, tileY);
    if (isTrampoline) return true;

    const isTempPlatform = me._hasTempPlatformAtPos(tileX, tileY);
    if (isTempPlatform) return true;

    if (tileX < me._currentLevelTileX) return true;

    const tile = me._tilemapLayer.getTileAt(tileX, tileY);

    return !tile || tile.index > 0;
  }

  _hasActiveTrampolineAtPos(tileX, tileY) {
    const me = this;

    for (let i = 0; i < me._mainLevelContainer.trampolines.length; ++i) {
      const trampoline = me._mainLevelContainer.trampolines[i];
      if (!trampoline._isActive || trampoline._tileX != tileX) continue;

      const isTrampolineCell =
        tileY == trampoline._tileY || tileY == trampoline._tileY - 1;

      if (isTrampolineCell) return true;
    }

    return false;
  }

  _hasTempPlatformAtPos(tileX, tileY) {
    const me = this;
    for (let i = 0; i < me._mainLevelContainer.tempPlatforms.length; ++i) {
      const tempPlatform = me._mainLevelContainer.tempPlatforms[i];
      if (
        tempPlatform._tileX == tileX &&
        tempPlatform._tileY == tileY &&
        tempPlatform._isActive
      )
        return true;
    }

    return false;
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
          y: trampoline._tileY - 2,
        };
        me._movePlayerPosTo(newPlayerTilePos);
        break;
      }
    }

    for (let i = 0; i < me._mainLevelContainer.tempPlatforms.length; ++i) {
      const tempPlatform = me._mainLevelContainer.tempPlatforms[i];
      if (tempPlatform._isActive) tempPlatform.checkPlayer(me);
    }

    // spikes
    for (let i = 0; i < me._mainLevelContainer.spikes.length; ++i) {
      const spike = me._mainLevelContainer.spikes[i];
      if (spike.checkPlayer(me)) {
        for (let j = 0; j < me._mainLevelContainer.spikes.length; ++j)
          me._mainLevelContainer.spikes[j]._isBlood = j == i;
        return me._processDeath(true);
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

  _processDeath(ignorePhantom) {
    const me = this;

    const playerObj = me.player.toGameObject();
    if (!ignorePhantom) {
      me._phantomDeath.setPosition(playerObj.x, playerObj.y).setVisible(true);
    }

    me._bloodParticles.setPosition(playerObj.x, playerObj.y).explode(32);

    me.resetCurrentLevel();
    return Enums.BitResult.DEATH;
  }

  _doPlayerActions(commands) {
    const me = this;

    if (me._isPlayerFalling) {
      me._movePlayerPosTo({ x: me.playerTilePos.x, y: me.playerTilePos.y + 1 });
    }

    me.player.toIdle();

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
