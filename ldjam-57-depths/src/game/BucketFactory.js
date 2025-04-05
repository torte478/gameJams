import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Consts from "./Consts.js";
import Garbage from "./Garbage.js";

export default class BucketFactory {
  _nextUpdateSec = 0;

  /** @type {Phaser.Geom.Rectangle} */
  _spawnRect;

  /** @type {Garbage} */
  _garbage;

  constructor(x, y, garbage) {
    const me = this;

    me._garbage = garbage;

    const image = Here._.add
      .image(x, y, "shop", 2)
      .setDepth(Consts.Depth.Floor);
    me._spawnRect = image.getBounds();
  }

  update(timeSec) {
    const me = this;

    if (timeSec < me._nextUpdateSec) return;

    const bodies = Here._.physics.overlapRect(
      me._spawnRect.x,
      me._spawnRect.y,
      me._spawnRect.width,
      me._spawnRect.height,
      true,
      false
    );
    const bucket = Utils.firstOrNull(bodies, (b) => b.gameObject.isBucket);
    if (!bucket) {
      me._garbage.createBucket(
        me._spawnRect.centerX,
        me._spawnRect.centerY + 10,
        0
      );
    }

    me._nextUpdateSec = timeSec + 1;
  }
}
