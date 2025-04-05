import Here from "../framework/Here.js";
import Config from "./Config.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";
import Garbage from "./Garbage.js";
import Tools from "./Tools.js";

export default class Dumpster {
  /** @type {Garbage} */
  _garbage;

  /** @type {Tools} */
  _tools;

  /** @type {Phaser.Physics.Arcade.Image} */
  _sprite;

  constructor(garbage, tools) {
    const me = this;

    me._garbage = garbage;
    me._tools = tools;

    me._sprite = Here._.physics.add
      .staticImage(200, 600, "shop", 0)
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

    const frame =
      me._tools._handContentType == Enums.HandContent.BAG &&
      Phaser.Geom.Rectangle.ContainsPoint(me._sprite.getBounds(), mousePos)
        ? 1
        : 0;
    me._sprite.setFrame(frame);
  }

  _onMovableToShop(movable) {
    const me = this;

    if (!!movable.isBag) {
      me._garbage.removeBag(movable);
      me._tools.increaseMana(Config.Tools.UtilizeBagCost);
      return;
    }

    if (!!movable.isBucket) {
      me._garbage.removeBucket(movable);
      me._garbage.createBucket(300, 200);
    }
  }
}
