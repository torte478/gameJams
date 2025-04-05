import Phaser from "../lib/phaser.js";

import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";

import Config from "./Config.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";
import Player from "./Player.js";

export default class Game {
  /** @type {Phaser.GameObjects.Text} */
  _log;

  /** @type {Player} */
  _player;

  constructor() {
    const me = this;

    Here._.cameras.main.setBackgroundColor(0xd3d3d3);

    me._player = new Player();

    Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
      me._log = Here._.add
        .text(10, 10, "", { fontSize: 18, backgroundColor: "#000" })
        .setScrollFactor(0)
        .setDepth(Consts.Depth.Max);
    });
  }

  update(deltaSec) {
    const me = this;

    if (
      Here.Controls.isPressedOnce(Enums.Keyboard.RESTART) &&
      Utils.isDebug(Config.Debug.Global)
    ) {
      Here._.scene.restart({ isRestart: true });
    }

    me._gameLoop(deltaSec);

    Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
      const mouse = Here._.input.activePointer;

      let text = `mse: ${mouse.worldX | 0} ${mouse.worldY | 0}\n`;

      me._log.setText(text);
    });
  }

  _gameLoop(deltaSec) {
    const me = this;

    me._player.update(deltaSec);
  }
}
