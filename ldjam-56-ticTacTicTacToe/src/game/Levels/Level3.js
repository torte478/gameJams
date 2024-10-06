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
  }

  start() {
    const me = this;

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

    Here._.add.tween({
      targets: me._container,
      alpha: { from: 0, to: 1 },
      duration: Config.Duration.Layer,
    });
  }

  stop() {
    const me = this;

    const children = Utils.copyArray(me._container.getAll());
    if (children.length == 0) return;

    Here._.add.tween({
      targets: me._container,
      alpha: { from: 1, to: 0 },
      duration: Config.Duration.Layer,
      onComplete: () => {
        for (let i = 0; i < children.length; ++i) {
          me._container.remove(children[i]);
          children.tween.stop();
          me._pool.killAndHide(children[i]);
        }
      },
    });
  }
}
