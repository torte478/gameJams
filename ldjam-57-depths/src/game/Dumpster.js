import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Config from "./Config.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";
import Garbage from "./Garbage.js";
import Graphics from "./Graphics.js";
import Tools from "./Tools.js";

export default class Dumpster {
  /** @type {Garbage} */
  _garbage;

  /** @type {Tools} */
  _tools;

  /** @type {Phaser.Physics.Arcade.Image} */
  _sprite;

  /** @type {Graphics} */
  _graphics;

  /** @type {Phaser.GameObjects.Group} */
  _manaBallPool;

  constructor(x, y, garbage, tools, graphics) {
    const me = this;

    me._garbage = garbage;
    me._tools = tools;
    me._graphics = graphics;
    me._manaBallPool = Here._.add.group({
      defaultKey: "mana_ball",
      maxSize: 16,
    });

    me._sprite = Here._.physics.add
      .staticImage(x, y, "shop", 0)
      .setDepth(Consts.Depth.FloorPlusOne);

    Here._.physics.add.overlap(
      me._sprite,
      me._garbage._movablePool,
      (dumpster, movable) => me._onMovableToShop(movable),
      null,
      me
    );

    Here._.physics.add.overlap(
      me._sprite,
      me._garbage._spotPool,
      (dumpster, spot) => me._garbage.removeSpot(spot),
      null,
      me
    );
  }

  update(mousePos) {
    const me = this;

    const contentType = me._tools._handContentType;
    const frame =
      (contentType == Enums.HandContent.BAG ||
        contentType == Enums.HandContent.BUCKET) &&
      Phaser.Geom.Rectangle.ContainsPoint(me._sprite.getBounds(), mousePos)
        ? 1
        : 0;
    me._sprite.setFrame(frame);
  }

  _onMovableToShop(movable) {
    const me = this;

    if (!!movable.isBag) {
      me._garbage.removeBag(movable);

      me._startManaBall(Config.Tools.UtilizeBagCost);
      return;
    }

    if (!!movable.isBucket) {
      me._garbage.removeBucket(movable);
      me._startManaBall(Config.Tools.UtilizeBucketCost);
      return;
    }
  }

  _startManaBall(cost) {
    const me = this;

    /** @type {Phaser.GameObjects.Image} */
    const manaBall = me._manaBallPool.get(me._sprite.x, me._sprite.y);

    manaBall.setActive(true).setVisible(true).setDepth(Consts.Depth.UI);
    const target = Utils.buildPoint(
      Here._.cameras.main.scrollX + 50,
      Here._.cameras.main.scrollY + 50
    );

    Here._.add.tween({
      targets: manaBall,
      duration: Utils.getTweenDuration(me._sprite, target, 2000),
      x: target.x,
      y: target.y,
      onComplete: () => {
        me._graphics.manaParticles();
        me._manaBallPool.killAndHide(manaBall);
        me._tools.changeMana(cost);
      },
    });
  }
}
