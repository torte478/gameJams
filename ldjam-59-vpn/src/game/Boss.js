import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Config from "./Config.js";
import Consts from "./Consts.js";

export default class Boss {
  /** @type {Phaser.GameObjects.Image[]} */
  _sprites = [];

  /** @type {Phaser.GameObjects.Image} */
  _redFade;

  /** @type {Number} */
  hp;

  constructor() {
    const me = this;

    me.hp = Config.BossHP;

    me._redFade = Here._.add
      .image(Consts.Viewport.Width / 2, Consts.Viewport.Height / 2, "redFade")
      .setScrollFactor(0)
      .setScale(10)
      .setAlpha(0)
      .setDepth(Consts.Depth.Fade);

    me._createBossSprite(300, -100, 0, 0, 1);
    me._createBossSprite(800, -120, 0, 0, 1);
  }

  startFinalBossSequence() {
    const me = this;

    me.hp = Config.BossHP;
  }

  runGameRestartSequence() {
    const me = this;

    for (const sprite of me._sprites) {
      sprite.myTweenField.stop();
      sprite.myTweenField = Here._.add.tween({
        targets: sprite,
        x: Consts.Viewport.Width / 2,
        y: Consts.Viewport.Height / 2,
        duration: Config.Time.P2_1_BossAttackAndFade,
        ease: "sine.in",
      });
    }

    Here._.add.tween({
      targets: me._redFade,
      alpha: { from: 0, to: 1 },
      ease: "sine.out",
      duration: Config.Time.P2_1_BossAttackAndFade,
    });
  }

  hideRedFadeWithReset() {
    const me = this;

    Here._.add.tween({
      targets: me._redFade,
      alpha: { from: 1, to: 0 },
      ease: "sine.out",
      duration: Config.Time.P3_FadeOut,
    });

    for (const sprite of me._sprites) {
      me._resetSprite(sprite);
    }
  }

  applyDamage(damage) {
    const me = this;

    me.hp -= damage;
  }

  _createBossSprite(x, y, angle, diffX, diffY) {
    const me = this;

    const index = me._sprites.length;
    const sprite = Here._.add.image(x, y, "boss").setAngle(angle);
    sprite.originIndex = index;
    sprite.originPos = Utils.buildPoint(x, y);
    sprite.originDiffPos = Utils.buildPoint(diffX, diffY);

    me._resetSprite(sprite);

    me._sprites.push(sprite);
  }

  /**
   * @param {Phaser.GameObjects.Image} sprite
   */
  _resetSprite(sprite) {
    const me = this;

    /** @type {Phaser.Math.Vector2} */
    const originPos = sprite.originPos;

    /** @type {Phaser.Math.Vector2} */
    const originDiffPos = sprite.originDiffPos;

    /** @type {Number} */
    const index = sprite.originIndex;

    sprite.setPosition(originPos.x, originPos.y);

    sprite.myTweenField = Here._.add.tween({
      targets: sprite,
      x: {
        from: originPos.x + originDiffPos.x * Config.BossJiggleOffset,
        to: originPos.x - originDiffPos.x * Config.BossJiggleOffset,
      },
      y: {
        from: originPos.y + originDiffPos.y * Config.BossJiggleOffset,
        to: originPos.y - originDiffPos.y * Config.BossJiggleOffset,
      },
      yoyo: true,
      repeat: -1,
      delay: index * 700,
      duration: 1000,
      ease: "sine.inOut",
    });
  }
}
