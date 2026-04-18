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

  /** @type {Boolean} */
  _isEating = false;

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

  update() {
    const me = this;

    if (!me._isEating) return;

    if (me._targetEdge.hasSignalAtMiddle()) {
      console.log("eat signal!!!");
      me._targetEdge.signalEaten();
    }
  }

  /**
   * @param {Edge} edge
   */
  setTarget(edge) {
    const me = this;

    if (!!me._targetEdge) throw "target already exists";

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
      onComplete: () => {
        me._movementTween = null;
        me._isEating = true;
      },
    });
  }

  /** @type {Edge} */
  checkEdgeRemove(edge) {
    const me = this;

    if (!me._targetEdge || !me._targetEdge.equalTo(edge)) return;

    if (!!me._movementTween) {
      me._movementTween.stop();
      me._movementTween = null;
    }

    me._targetEdge = null;
    me._isEating = false;
  }
}
