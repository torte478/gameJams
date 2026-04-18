import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Config from "./Config.js";
import Edge from "./Edge.js";

export default class RKN {
  /** @type {Phaser.GameObjects.Sprite} */
  _sprite;

  /** @type {Phaser.GameObjects.Container} */
  _container;

  /** @type {Edge | null} */
  _targetEdge = null;

  /** @type {Phaser.Tweens.Tween | null} */
  _movementTween = null;

  constructor(x, y) {
    const me = this;

    me._sprite = Here._.add.sprite(0, 0, "rkn", 0);
    me._container = Here._.add.container(x, y, [me._sprite]);
  }

  /**
   * @returns {Phaser.GameObjects.Container}
   */
  toGameObj() {
    const me = this;

    return me._container;
  }

  getPos() {
    const me = this;

    return Utils.toPoint(me._container);
  }

  /**
   * @param {Edge} edge
   */
  setTarget(edge) {
    const me = this;

    if (!!me._targetEdge) throw "target edge already exists!";

    me._targetEdge = edge;

    const targetPos = edge.getMiddle();
    me._movementTween = Here._.add.tween({
      targets: me.toGameObj(),
      x: targetPos.x,
      y: targetPos.y,
      duration: Utils.getTweenDuration(
        me.getPos(),
        targetPos,
        Config.Speed.RknMovement,
      ),
    });
  }
}
