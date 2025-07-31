import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";

import Config from "./Config.js";
import Consts from "./Consts.js";
import DrumMachine from "./DrumMachine.js";
import Enums from "./Enums.js";
import LevelComponent from "./LevelComponent.js";

export default class Game {
  /** @type {Phaser.GameObjects.Text} */
  _log;

  /** @type {DrumMachine} */
  _drumMachine;

  /** @type {LevelComponent} */
  _levelComponent;

  constructor() {
    const me = this;

    const sceneCamera = Here._.cameras.main;
    sceneCamera
      .setBackgroundColor("#9084A5")
      .setSize(
        Consts.Viewport.Width,
        Consts.Viewport.Height - Consts.DrumMachine.ViewHeight
      );

    me._drumMachine = new DrumMachine();
    me._levelComponent = new LevelComponent();

    Here._.input.on(
      "pointerdown",
      (pointer) =>
        me._drumMachine.onPointerDown(pointer.worldX, pointer.worldY),
      me
    );

    Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
      me._log = Here._.add
        .text(10, 10, "", { fontSize: 18, backgroundColor: "#000" })
        .setScrollFactor(0)
        .setDepth(Consts.Depth.Max);

      me._drumMachine._camera.ignore(me._log);
    });
  }

  update(time, delta) {
    const me = this;

    if (
      Here.Controls.isPressedOnce(Enums.Keyboard.RESTART) &&
      Utils.isDebug(Config.Debug.Global)
    )
      Here._.scene.restart({ isRestart: true });

    me._drumMachine.update(time);

    Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
      const mouse = Here._.input.activePointer;

      let text =
        `mse: ${mouse.worldX | 0} ${mouse.worldY | 0}\n` +
        `tme: ${(time / 1000) | 0} s.\n` +
        `bit: ${me._drumMachine._currentBit}`;

      me._log.setText(text);
    });
  }
}
