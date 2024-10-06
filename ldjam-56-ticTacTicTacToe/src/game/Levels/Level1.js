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
      .setDepth(Consts.Depth.Stuff)
      .setAlpha(0);
  }

  start() {
    const me = this;

    for (let i = 0; i < 20; ++i) {
      const isCross = i % 2 == 0;
      /** @type {Phaser.Physics.Arcade.Sprite} */
      const item = me._pool.create(0, 0, "level1_anim");

      item.setVelocity(Utils.getRandom(-50, 50), Utils.getRandom(-50, 50));
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
          me._pool.killAndHide(children[i]);
        }
      },
    });
  }
}
