import Here from "../../framework/Here.js";
import Utils from "../../framework/Utils.js";
import ColorConfig from "../ColorConfig.js";
import Config from "../Config.js";
import Consts from "../Consts.js";

export default class Level4 {
  /** @type {Phaser.Physics.Arcade.Group} */
  _pool;

  /** @type {ColorConfig} */
  _color;

  /** @type {Phaser.GameObjects.Container} */
  _container;

  /** @type {Phaser.GameObjects.Image} */
  _boss;

  /** @type {Phaser.GameObjects.Group} */
  _bullets;

  _isRunning = false;

  constructor() {
    const me = this;

    me._pool = Here._.physics.add.group({
      bounceX: 1,
      bounceY: 1,
      collideWorldBounds: true,
    });

    me._bullets = Here._.add.group();

    me._color = Config.Colors[4];

    me._container = Here._.add
      .container(-200, -100, [])
      .setDepth(Consts.Depth.Stuff)
      .setAlpha(0);

    me._boss = Here._.add.image(0, 0, "boss");

    me._boss.tween = Here._.add.tween({
      targets: me._boss,
      y: { from: 900, to: 0 },
      duration: 20000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    me._container.add(me._boss);

    const goddamnRect = new Phaser.Geom.Rectangle(
      0,
      0,
      Consts.Viewport.Width,
      Consts.Viewport.Height
    );

    for (let i = 0; i < 4; ++i) {
      /** @type {Phaser.Physics.Arcade.Sprite} */
      const item = me._pool.create(0, 0, "level4", 0);

      const speed = 40;
      item.setVelocity(
        Utils.getRandom(-speed, speed),
        Utils.getRandom(-speed, speed)
      );
      item.setAngle(Utils.getRandom(-90, 90));
      item.setAngularVelocity(Utils.getRandom(-10, 10));
      item.play("level4");

      item.tween = Here._.tweens.addCounter({
        from: 0,
        to: 1,
        duration: 3000,
        delay: Utils.getRandom(0, 1000),
        repeat: -1,
        onRepeat: () => {
          const bullet = me._bullets.create(
            item.x + me._container.x,
            item.y + me._container.y,
            "bullet",
            0
          );
          bullet.setVisible(me._isRunning);
          bullet.setDepth(Consts.Depth.Stuff);
          let point = Phaser.Geom.Rectangle.Random(goddamnRect);
          point = Utils.buildPoint(
            point.x + me._container.x,
            point.y + me._container.y
          );
          Here._.tweens.add({
            targets: bullet,
            x: point.x,
            y: point.y,
            duration: Utils.getTweenDuration(Utils.toPoint(bullet), point, 500),
            onComplete: () => {
              bullet.play("bullet");
              Here._.time.delayedCall(500, () => {
                me._bullets.killAndHide(bullet);
              });
            },
          });
        },
      });

      me._container.add(item);
    }

    Phaser.Actions.RandomRectangle(me._container.getAll(), goddamnRect);
    me._boss.x = 500;

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
