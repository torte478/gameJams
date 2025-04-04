import Here from "../../framework/Here.js";
import Utils from "../../framework/Utils.js";
import ColorConfig from "../ColorConfig.js";
import Config from "../Config.js";
import Consts from "../Consts.js";

export default class Level1 {
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

    me._color = Config.Colors[1];

    me._container = Here._.add
      .container(-200, -100, [])
      .setDepth(Consts.Depth.Stuff);

    for (let i = 0; i < 20; ++i) {
      const isCross = i % 2 == 0;
      /** @type {Phaser.Physics.Arcade.Sprite} */
      const item = me._pool.create(0, 0, "level1_anim");

      const speed = 50;
      item.setVelocity(
        Utils.getRandom(-speed, speed),
        Utils.getRandom(-speed, speed)
      );
      item.setAngularVelocity(Utils.getRandom(10, 90));

      item.setTint(me._color.item);
      item.play(isCross ? "level1_cross" : "level1_nougth");
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

    me._container.setAlpha(1);
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
