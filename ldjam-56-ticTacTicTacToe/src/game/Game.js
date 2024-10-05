import Phaser from "../lib/phaser.js";

import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";

import Config from "./Config.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";
import Grid from "./Grid.js";
import Controls from "../framework/Controls.js";

export default class Game {
  /** @type {Phaser.GameObjects.Text} */
  _log;

  /** @type {Phaser.GameObjects.Image} */
  _phantom;

  constructor() {
    const me = this;

    Here._.cameras.main.setScroll(-200, -100);

    me._phantom = Here._.add
      .image(100, 100, "step", 0)
      .setVisible(false)
      .setAlpha(0.5);

    Here._.add.image(Consts.Sizes.Cell * 1.5, Consts.Sizes.Cell * 1.5, "grid");

    Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
      me._log = Here._.add
        .text(10, 10, "", { fontSize: 18, backgroundColor: "#000" })
        .setScrollFactor(0)
        .setDepth(Consts.Depth.Max);
    });
  }

  update() {
    const me = this;

    if (
      Here.Controls.isPressedOnce(Enums.Keyboard.RESTART) &&
      Utils.isDebug(Config.Debug.Global)
    ) {
      Here._.scene.restart({ isRestart: true });
    }

    me._gameLoop();

    Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
      const mouse = Here._.input.activePointer;
      let text = `mse: ${mouse.worldX | 0} ${mouse.worldY.y | 0}\n`;

      me._log.setText(text);
    });
  }

  _gameLoop() {
    const me = this;

    const mouse = Here._.input.activePointer;
    const worldPos = Utils.buildPoint(mouse.worldX, mouse.worldY);
    const cell = Grid.posToCell(worldPos);
    me._showPhantom(cell);
  }

  _showPhantom(cell) {
    const me = this;

    if (cell == -1) {
      me._phantom.setVisible(false);
      return;
    }

    const pos = Grid.cellToPos(cell);
    me._phantom.setVisible(true).setPosition(pos.x, pos.y);
  }
}
