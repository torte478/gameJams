import Here from "../framework/Here.js";
import Config from "./Config.js";
import Consts from "./Consts.js";
import Garbage from "./Garbage.js";
import Tools from "./Tools.js";

export default class Dumpster {
  /** @type {Garbage} */
  _garbage;

  /** @type {Tools} */
  _tools;

  constructor(garbage, tools) {
    const me = this;

    me._garbage = garbage;
    me._tools = tools;

    const sprite = Here._.physics.add
      .staticImage(800, 100, "shop")
      .setDepth(Consts.Depth.FloorPlusOne);

    Here._.physics.add.overlap(
      sprite,
      me._garbage._movablePool,
      (dumpster, movable) => me._onMovableToShop(movable),
      null,
      me
    );

    Here._.physics.add.overlap(
      sprite,
      me._garbage._spotPool,
      (dumpster, spot) => me._garbage.removeSpot(spot),
      null,
      me
    );
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
