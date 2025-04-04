import Here from "../../framework/Here.js";
import Utils from "../../framework/Utils.js";
import ColorConfig from "../ColorConfig.js";
import Config from "../Config.js";
import Consts from "../Consts.js";

export default class Level2 {
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
    Here._.physics.add.collider(me._pool);

    me._color = Config.Colors[2];

    me._container = Here._.add
      .container(-200, -100, [])
      .setDepth(Consts.Depth.Stuff)
      .setAlpha(0);

    for (let i = 0; i < 10; ++i) {
      const frame = (i + 4) % 8;
      /** @type {Phaser.Physics.Arcade.Sprite} */
      const item = me._pool.create(0, 0, "level2", frame);
      item.setFlipX(Utils.getRandom(0, 1) == 0);

      const speed = 40;
      item.setVelocity(
        Utils.getRandom(-speed, speed),
        Utils.getRandom(-speed, speed)
      );

      item.setTint(me._color.item);
      me._container.add(item);
    }

    Phaser.Actions.RandomRectangle(
      me._container.getAll(),
      new Phaser.Geom.Rectangle(
        0,
        0,
        Consts.Viewport.Width,
        Consts.Viewport.Height
      )
    );

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
        me._container.setVisible(false);
      },
    });
  }
}
