import Here from "../framework/Here.js";
import Config from "./Config.js";

export default class Boss {
  /** @type {Phaser.GameObjects.Image[]} */
  _sprites = [];

  /** @type {Number} */
  hp;

  constructor() {
    const me = this;

    me.hp = Config.BossHP;

    me._createBossSprite(300, -100, 0, 0, 1);
    me._createBossSprite(800, -120, 0, 0, 1);
  }

  startFinalBossSequence() {
    const me = this;

    me.hp = Config.BossHP;
  }

  applyDamage(damage) {
    const me = this;

    me.hp -= damage;
  }

  _createBossSprite(x, y, angle, diffX, diffY) {
    const me = this;

    const index = me._sprites.length;
    const sprite = Here._.add.image(x, y, "boss").setAngle(angle);

    sprite.myTweenField = Here._.add.tween({
      targets: sprite,
      x: {
        from: x + diffX * Config.BossJiggleOffset,
        to: x - diffX * Config.BossJiggleOffset,
      },
      y: {
        from: y + diffY * Config.BossJiggleOffset,
        to: y - diffY * Config.BossJiggleOffset,
      },
      yoyo: true,
      repeat: -1,
      delay: index * 700,
      duration: 1000,
      ease: "sine.inOut",
    });

    me._sprites.push(sprite);
  }
}
