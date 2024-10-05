import Phaser from "../lib/phaser.js";

import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";

import Config from "./Config.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";
import Chunk from "./Chunk.js";

export default class Game {
  /** @type {Phaser.GameObjects.Text} */
  _log;

  /** @type {Chunk} */
  _chunk;

  constructor() {
    const me = this;

    Here._.cameras.main.setScroll(-200, -100);

    Here._.add.image(Consts.Sizes.Cell * 1.5, Consts.Sizes.Cell * 1.5, "grid");

    me._chunk = new Chunk();

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

    const mouse = Here._.input.activePointer; // TODO
    me._chunk.update(Utils.buildPoint(mouse.worldX, mouse.worldY));

    Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
      let text =
        `mse: ${mouse.worldX | 0} ${mouse.worldY | 0}\n` +
        `cel: ${me._chunk._foo}`;

      me._log.setText(text);
    });
  }
}
