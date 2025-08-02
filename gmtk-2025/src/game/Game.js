import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";

import Config from "./Config.js";
import Consts from "./Consts.js";
import DrumKit from "./DrumKit.js";
import Enums from "./Enums.js";
import LevelConfig from "./LevelConfig.js";
import World from "./World.js";

export default class Game {
  /** @type {Phaser.GameObjects.Text} */
  _log;

  /** @type {DrumKit} */
  _drumKit;

  /** @type {World} */
  _world;

  /** @type {Boolean} */
  _isWindowActive;

  /** @type {Number} */
  _gameTimer;

  /** @type {Number} */
  _currentLevelIndex = 0;

  /** @type {Number} */
  _gameState = Config.StartState;

  constructor() {
    const me = this;

    Here._.input.mouse.disableContextMenu();

    const sceneCamera = Here._.cameras.main;
    sceneCamera
      .setBackgroundColor("#9084A5")
      .setSize(
        Consts.Viewport.Width,
        Consts.Viewport.Height - Consts.DrumKit.ViewHeight
      );

    const levelConfig = Utils.firstOrNull(
      Config.Levels,
      (c) => c.name == Config.LevelOrder[me._currentLevelIndex]
    );

    if (!levelConfig) throw "error";

    me._drumKit = new DrumKit(levelConfig);
    me._world = new World(levelConfig);
    me._gameTimer = 0;

    Here._.input.on(
      "pointerdown",
      (pointer) => {
        me._onLMBClick(pointer);
      },
      me
    );

    me._isWindowActive = true;
    window.addEventListener("focus", () => {
      me._isWindowActive = true;
    });

    window.addEventListener("blur", () => {
      me._isWindowActive = false;
    });

    Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
      me._log = Here._.add
        .text(10, 10, "", { fontSize: 18, backgroundColor: "#000" })
        .setScrollFactor(0)
        .setDepth(Consts.Depth.Max);

      me._drumKit._camera.ignore(me._log);
    });
  }

  update(time, delta) {
    const me = this;

    if (
      Here.Controls.isPressedOnce(Enums.Keyboard.RESTART) &&
      Utils.isDebug(Config.Debug.Global)
    ) {
      Here._.scene.restart({ isRestart: true });
    }

    me._gameLoop(delta);

    Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
      const mouse = Here._.input.activePointer;

      const tileX = Math.floor(mouse.worldX / Consts.Unit.Normal);
      const tileY = Math.floor(mouse.worldY / Consts.Unit.Normal);

      let text =
        `mse: ${mouse.worldX | 0} ${mouse.worldY | 0}\n` +
        `tle: ${tileX} ${tileY}\n` +
        `tme: ${(me._gameTimer / 1000) | 0} sec\n` +
        `ste: ${me._gameState}`;

      me._log.setText(text);
    });
  }

  _gameLoop(delta) {
    const me = this;

    me._gameTimer += delta;

    const overallBit = Math.floor(me._gameTimer * Consts.BitPerMs);
    const currentBit = overallBit % me._drumKit.loopLength;

    const isNewBit = currentBit != me._drumKit._currentBit;
    const commands = me._drumKit.update(currentBit, me._isWindowActive);
    const bitResult = me._world.update(
      commands,
      currentBit,
      me._gameState,
      isNewBit
    );

    if (me._gameState == Enums.GameStates.BUSY) {
      if (
        !me._world.completeLevelTransition ||
        !me._drumKit.completeLevelTransition
      )
        return;

      me._gameState = Enums.GameStates.PLAY;
      me._world.runWithNextLoop();
    }

    if (bitResult == Enums.BitResult.WIN) {
      me._gotoNextLevel();
    } else if (bitResult == Enums.BitResult.DEATH) {
      me._gameState = Enums.GameStates.EDIT;
      me._drumKit.showDeathIcon(currentBit);
    }
  }

  _gotoNextLevel() {
    const me = this;

    me._currentLevelIndex =
      (me._currentLevelIndex + 1) % Config.LevelOrder.length;

    const levelConfig = Utils.firstOrNull(
      Config.Levels,
      (c) => c.name == Config.LevelOrder[me._currentLevelIndex]
    );

    if (!levelConfig) throw "error";

    me._gameState = Enums.GameStates.BUSY;
    me._world.gotoNextLevel(levelConfig);
    me._drumKit.gotoNextLevel(levelConfig);
  }

  _onLMBClick(pointer) {
    const me = this;

    const pos = Utils.buildPoint(pointer.worldX, pointer.worldY);
    if (me._gameState == Enums.GameStates.PLAY) {
      // play state
      if (me._drumKit.isInsideView(pos)) {
        me._world.resetCurrentLevel();
        me._gameState = Enums.GameStates.EDIT;
      }
      me._drumKit.onPointerDown(pos.x, pos.y);
    } else if (me._gameState == Enums.GameStates.EDIT) {
      // edit state
      if (me._world.isInsideView(pos)) {
        me._world.runWithNextLoop();
        me._gameState = Enums.GameStates.PLAY;
      } else me._drumKit.onPointerDown(pos.x, pos.y);
    }
  }
}
