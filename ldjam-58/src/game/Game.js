import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Collection from "./Collection.js";

import Config from "./Config.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";
import Transport from "./Transport.js";

export default class Game {
  /** @type {Phaser.GameObjects.Text} */
  _log;

  /** @type {Collection} */
  _collection;

  /** @type {Phaser.GameObjects.Sprite} */
  _gnome;

  /** @type {Phaser.Cameras.Scene2D.Camera} */
  _camera;

  /** @type {Transport} */
  _transport;

  /** @type {Number} */
  _scrollX = 0;

  constructor() {
    const me = this;

    me._camera = Here._.cameras.main;
    me._camera.setBounds(-1000, 0, 2000, 800);

    me._collection = new Collection();

    me._transport = new Transport(10, 0.01, 0.01);

    const background = Here._.add
      .image(0, 0, "background")
      .setOrigin(0, 0)
      .setPosition(-Consts.Viewport.Width, 100)
      .setDepth(Consts.Depth.Background);

    me._gnome = Here._.add.sprite(500, 400, "gnome").play("gnome_idle");

    me._camera.startFollow(me._gnome, true);

    //Here._.add.image(850, 600, "order");

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

    me._gameLoop(deltaTime);

    Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
      const mouse = Here._.input.activePointer;

      let text =
        `mse: ${mouse.worldX | 0} ${mouse.worldY | 0}\n` +
        `pos: ${me._scrollX | 0}`;

      me._log.setText(text);
    });
  }

  _gameLoop(deltaTime) {
    const me = this;

    let velocityX = me._transport.getVelocity(deltaTime);

    if (velocityX !== 0) {
      me._scrollX += velocityX;
      if (me._scrollX >= 0) {
        me._gnome.setPosition(500, me._gnome.y);
        me._collection.updatePos(me._scrollX);
      } else {
        me._gnome.setPosition(500 + me._scrollX, me._gnome.y);
      }
    }
  }
}
