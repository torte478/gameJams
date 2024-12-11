import Phaser from "../lib/phaser.js";

import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";

import Config from "./Config.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";
import Yarik from "./Yarik.js";
import Lera from "./Lera.js";
import Cursor from "./Cursor.js";

export default class Game {
  /** @type {Phaser.GameObjects.Text} */
  _log;

  /** @type {Yarik} */
  _yarik;

  /** @type {Lera} */
  _lera;

  /** @type {Cursor} */
  _cursor;

  constructor() {
    const me = this;

    me._cursor = new Cursor();

    me._yarik = new Yarik();
    me._lera = new Lera();

    Here._.physics.add.collider(
      me._yarik.getGameObject(),
      me._lera.getGameObject()
    );

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
      const cursorPos = me._cursor.getPos();
      let text =
        `mse: ${mouse.worldX | 0} ${mouse.worldY | 0}\n` +
        `crs: ${cursorPos.x | 0} ${cursorPos.y | 0}`;

      me._log.setText(text);
    });
  }

  _gameLoop() {
    const me = this;

    me._yarik.update();
    me._lera.update(me._cursor.getPos());
  }
}
