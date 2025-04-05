import Phaser from "../lib/phaser.js";

import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";

import Config from "./Config.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";
import Player from "./Player.js";
import Garbage from "./Garbage.js";

export default class Game {
  /** @type {Phaser.GameObjects.Text} */
  _log;

  /** @type {Player} */
  _player;

  /** @type {Garbage} */
  _garbage;

  constructor() {
    const me = this;

    Here._.cameras.main.setBackgroundColor(0xd3d3d3);

    me._player = new Player();
    me._garbage = new Garbage(me._player.toGameObject());

    // ----

    Here._.input.on("pointerdown", me._onPointerDown, me);

    // ----

    me._garbage.createGarbage(550, 300);
    me._garbage.createGarbage(600, 330);
    me._garbage.createGarbage(500, 260);
    me._garbage.createGarbage(510, 291);

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

    Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
      const mouse = Here._.input.activePointer;

      let text = `mse: ${mouse.worldX | 0} ${mouse.worldY | 0}\n`;

      me._log.setText(text);
    });
  }

  _onPointerDown(pointer) {
    const me = this;

    const bodies = Here._.physics.overlapCirc(
      pointer.x,
      pointer.y,
      5,
      true,
      true
    );

    for (let i = 0; i < bodies.length; ++i) {
      const gameObj = bodies[i].gameObject;
      if (!gameObj.isGarbage) continue;

      me._garbage.removeGarbage(gameObj);
      const isFull = me._player.addGarbage();
      if (isFull) {
        me._garbage.createBag(me._player.toGameObject());
      }
      break;
    }
  }
}
