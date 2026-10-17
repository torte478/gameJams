import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";

import Config from "./Config.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";
import GUI from "./GUI.js";
import LevelInfo from "./LevelInfo.js";
import Phone from "./Phone.js";

export default class Game {
  /** @type {Phaser.GameObjects.Text} */
  _log;

  /** @type {Phone} */
  _phone;

  /** @type {GUI} */
  _gui;

  /** @type {Number} */
  _state;

  /** @type {LevelInfo | null} */
  _levelInfo = null;

  /** @type {Number} */
  _levelIndex = null;

  constructor() {
    const me = this;

    // init
    me._gui = new GUI();
    me._phone = new Phone(me._onDigitResolved, me._onTubeClick, me);

    me._state = Config.Start.State;

    // control
    Here._.input.on("pointerup", (pointer) => {
      if (pointer.leftButtonReleased()) {
        me._onLeftMouseButtonReleased();
      }
    });

    // debug log
    Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
      me._log = Here._.add
        .text(10, 10, "", { fontSize: 18, backgroundColor: "#000" })
        .setScrollFactor(0)
        .setDepth(Consts.Depth.Max);
    });

    // afterInit
    if (Utils.isDebug(Config.Debug.Level)) {
      me._goToLevel(Config.Start.DebugLevel);
    }
  }

  update(time, deltaTime) {
    const me = this;

    if (
      Here.Controls.isPressedOnce(Enums.Keyboard.RESTART) &&
      Utils.isDebug(Config.Debug.Global)
    )
      Here._.scene.restart({ isRestart: true });

    me._gameLoop(time, deltaTime / 1000);

    Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
      const mouse = Here._.input.activePointer;

      let text =
        `mse: ${mouse.worldX | 0} ${mouse.worldY | 0}\n` +
        `tme: ${(time / 1000) | 0} + ${deltaTime | 0}\n` +
        `stt: ${me._state}\n`;

      me._log.setText(text);
    });
  }

  _gameLoop(time, deltaTime) {
    const me = this;

    me._phone.update(deltaTime);
  }

  _onLeftMouseButtonReleased() {
    const me = this;

    me._phone.onPointerUp();
  }

  _onDigitResolved(digit) {
    const me = this;

    if (digit < 0 || digit >= 10) {
      Utils.debugLog("missclick");
      return;
    }

    me._gui.appendText(digit);
  }

  _goToLevel(levelIndex) {
    const me = this;

    if (levelIndex < 0 || levelIndex >= Config.Levels.length) {
      throw `wrong level index ${levelIndex}`;
    }

    me._levelIndex = levelIndex;
    me._levelInfo = Config.Levels[levelIndex];
    me._gui.changeLevel(levelIndex, me._levelInfo);
    me._state = Enums.GameState.LEVEL;
  }

  _onTubeClick() {
    const me = this;

    if (me._state === Enums.GameState.MAIN_MENU) {
      const selectedLevel = me._gui.textToNumber();
      if (selectedLevel === -1) return;

      me._goToLevel(selectedLevel);
      return;
    }

    if (me._state === Enums.GameState.LEVEL) {
      return me._processLevelTubeClick();
    }
  }

  _processLevelTubeClick() {
    const me = this;

    const currentStr = me._gui.getMainText();

    if (currentStr === me._levelInfo.goal) {
      me._goToLevel(me._levelIndex + 1);
      return;
    } else {
      me._gui.resetMainText();
    }
  }
}
