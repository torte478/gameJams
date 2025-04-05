import Phaser from "../lib/phaser.js";

import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";

import Config from "./Config.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";
import Player from "./Player.js";
import Garbage from "./Garbage.js";
import Tools from "./Tools.js";

export default class Game {
  /** @type {Phaser.GameObjects.Text} */
  _log;

  /** @type {Player} */
  _player;

  /** @type {Garbage} */
  _garbage;

  /** @type {Tools} */
  _tools;

  constructor() {
    const me = this;

    Here._.cameras.main.setBackgroundColor(0xd3d3d3);

    me._player = new Player();
    me._garbage = new Garbage(me._player.toGameObject());
    me._tools = new Tools(me._garbage);

    // ----

    Here._.input.on("pointerdown", me._onPointerDown, me);

    // ----

    const rect = new Phaser.Geom.Rectangle(100, 100, 600, 600);
    for (let i = 0; i < 5; ++i) {
      const pos = Phaser.Geom.Rectangle.Random(rect);
      me._garbage.createGarbage(pos.x, pos.y);
    }

    for (let i = 0; i < 5; ++i) {
      const pos = Phaser.Geom.Rectangle.Random(rect);
      me._garbage.createSpot(pos.x, pos.y);
    }

    // me._garbage.createSpot(550, 300);
    // me._garbage.createSpot(600, 330);
    // me._garbage.createSpot(500, 260);
    // me._garbage.createSpot(510, 291);

    me._garbage.createBucket(300, 200);

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

    me._player.update(deltaSec);
    me._tools.update();

    Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
      const mouse = Here._.input.activePointer;

      let text =
        `mse: ${mouse.worldX | 0} ${mouse.worldY | 0}\n` +
        `tool: ${me._tools.currentTool}\n` +
        `mop: ${me._tools._mopDirt}`;

      me._log.setText(text);
    });
  }

  _onPointerDown(pointer) {
    const me = this;

    me._tools.onPointerDown(pointer);
  }
}
