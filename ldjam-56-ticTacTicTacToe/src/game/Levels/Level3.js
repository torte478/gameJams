import Here from "../../framework/Here.js";
import Utils from "../../framework/Utils.js";
import ColorConfig from "../ColorConfig.js";
import Config from "../Config.js";
import Consts from "../Consts.js";

export default class Level3 {
  /** @type {Phaser.Physics.Arcade.Group} */
  _pool;

  /** @type {ColorConfig} */
  _color;

  /** @type {Phaser.GameObjects.Container} */
  _container;

  _isRunning = false;

  constructor() {
    const me = this;

    me._pool = Here._.physics.add.group({
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true,
    });

    me._color = Config.Colors[3];

    me._container = Here._.add
      .container(-200, -100, [])
      .setDepth(Consts.Depth.Stuff)
      .setAlpha(0);

    for (let i = 0; i < 6; ++i) {
      const isCross = i < 3;
      /** @type {Phaser.Physics.Arcade.Sprite} */
      const item = me._pool.create(
        100 + i * 150,
        Utils.getRandom(0, 500),
        "level3",
        0
      );

      item.setFlipX(!isCross);

      const speed = 40;
      item.setVelocity(0, Utils.getRandom(-speed, speed));

      item.anims.playAfterDelay(
        isCross ? "level3_x" : "level3_o",
        Utils.getRandom(0, 500)
      );

      item.setTint(me._color.item);
      item.tween = Here._.add.tween({
        targets: item,
        angle: { from: -10, to: 10 },
        yoyo: true,
        duration: Utils.getRandom(600, 800),
        repeat: -1,
      });
      me._container.add(item);
    }

    me._container.setVisible(false);
  }

  start() {
    const me = this;

    me._isRunning = true;

    me._container.setAlpha(0);
    me._container.setVisible(true);

    Here._.add.tween({
      targets: me._container,
      alpha: { from: 0, to: 1 },
      duration: Config.Duration.Layer - 100,
    });
  }

  stop() {
    const me = this;

    if (!me._isRunning) return;

    me._isRunning = false;

    Here._.add.tween({
      targets: me._container,
      alpha: { from: 1, to: 0 },
      duration: Config.Duration.Layer - 100,
      onComplete: () => {
        me._container.setVisible(true);
      },
    });
  }
}
