import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";

import Config from "./Config.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";
import GUI from "./GUI.js";
import Phone from "./Phone.js";

export default class Game {
  /** @type {Phaser.GameObjects.Text} */
  _log;

  /** @type {Phone} */
  _phone;

  /** @type {GUI} */
  _gui;

  constructor() {
    const me = this;

    // init
    me._gui = new GUI();
    me._phone = new Phone(me._onDigitResolved, me);

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
  }

  update(time, deltaTime) {
    const me = this;

    if (
      Here.Controls.isPressedOnce(Enums.Keyboard.RESTART) &&
      Utils.isDebug(Config.Debug.Global)
    )
      Here._.scene.restart({ isRestart: true });

    me._gameLoop(time, deltaTime);

    Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
      const mouse = Here._.input.activePointer;

      let text =
        `mse: ${mouse.worldX | 0} ${mouse.worldY | 0}\n` +
        `tme: ${(time / 1000) | 0} + ${deltaTime | 1}\n` +
        `stt: ${me._phone._state}\n` +
        `deg: ${me._phone._currentAngle | 0}`;

      me._log.setText(text);
    });
  }

  _gameLoop(time, deltaTime) {
    const me = this;

    me._phone.update();
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
}
