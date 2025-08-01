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

  /** @type {Boolean} */
  _isPaused = false;

  /** @type {Number} */
  _gameTimer;

  /** @type {LevelConfig} */
  _currentLevelConfig;

  constructor() {
    const me = this;

    Here._.input.mouse.disableContextMenu();

    const sceneCamera = Here._.cameras.main;
    sceneCamera
      .setBackgroundColor("#9084A5")
      .setSize(
        Consts.Viewport.Width,
        Consts.Viewport.Height - Consts.DrumMachine.ViewHeight
      );

    me._currentLevelConfig = Utils.firstOrNull(
      Config.Levels,
      (c) => c.name == Config.LevelOrder[0]
    ); // TODO
    if (!me._currentLevelConfig) throw "error";

    me._drumKit = new DrumKit(me._currentLevelConfig);
    me._world = new World(me._currentLevelConfig);
    me._gameTimer = 0;

    const sceneCameraBounds = new Phaser.Geom.Rectangle(
      sceneCamera.scrollX,
      sceneCamera.scrollY,
      sceneCamera.width,
      sceneCamera.height
    );

    Here._.input.on(
      "pointerdown",
      (pointer) => {
        if (pointer.rightButtonDown()) me._tryProcessPause();
        else me._onLMBClick(pointer, sceneCameraBounds);
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
        `pse: ${me._isPaused}\n` +
        `tme: ${(me._gameTimer / 1000) | 0} sec`;

      me._log.setText(text);
    });
  }

  _gameLoop(delta) {
    const me = this;

    if (me._isPaused) return;

    me._gameTimer += delta;

    const overallBit = Math.floor(me._gameTimer * Consts.BitPerMs);
    const currentBit = overallBit % me._drumKit.loopLength;

    const commands = me._drumKit.update(currentBit, me._isWindowActive);
    if (!commands) return;

    const bitResult = me._world.applyBitChange(commands, currentBit);
    if (bitResult == Enums.BitResult.DEATH) {
      me._isPaused = !me._isPaused;
    } else if (bitResult == Enums.BitResult.WIN) {
      me._gotoNextLevel();
    }
  }

  _gotoNextLevel() {
    const me = this;
  }

  _tryProcessPause() {
    const me = this;

    if (!Utils.isDebug(Config.Debug.PauseOnRightClick)) return;

    me._isPaused = !me._isPaused;
  }

  _onLMBClick(pointer, sceneCameraBounds) {
    const me = this;

    const pos = Utils.buildPoint(pointer.worldX, pointer.worldY);
    if (Phaser.Geom.Rectangle.ContainsPoint(sceneCameraBounds, pos)) {
      me._gameTimer = 0;
      me._drumKit.reset();
      me._world.reset();
      me._isPaused = false;
    } else me._drumKit.onPointerDown(pos.x, pos.y);
  }
}
