import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Config from "./Config.js";
import Consts from "./Consts.js";
import Edge from "./Edge.js";
import Enums from "./Enums.js";
import Game from "./Game.js";
import VFX from "./VFX.js";

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

  /** @type {VFX} */
  _vfx;

  constructor(x, y, vfx) {
    const me = this;

    me._vfx = vfx;

    me._sprite = Here._.add.sprite(0, 0, "rkn", 0);
    me._container = Here._.add.container(x, y, [me._sprite]);

    me._container.setScale(Config.RknStartScale).setDepth(Consts.Depth.RKN);
    me._sprite.play("rkn_walk");
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

    if (!me._targetEdge.hasSignalAtMiddle()) return;

    me._targetEdge.signalEaten();
    me._vfx.minusOneParticles(me.getPos());

    if (me.isBigBoy() && me._trySpawnAnother()) {
      return;
    }

    me._eatSignal();
  }

  resetScale() {
    const me = this;

    me._container.setScale(Config.RknStartScale);
  }

  _trySpawnAnother() {
    const me = this;

    const parent = Game.instance._enemies;
    return parent.trySpawnAnother(me);
  }

  _eatSignal() {
    const me = this;

    me._sprite.play("rkn_eat");
    Here.Audio.playEat();

    const scale = Math.min(
      Config.RknMaxScale,
      me._container.scale + Config.RknScaleChange,
    );
    me._container.setScale(scale);
  }

  isBigBoy() {
    const me = this;

    return Math.abs(me._container.scale - Config.RknMaxScale) < 0.01;
  }

  /**
   * @param {Edge} edge
   */
  setTarget(edge) {
    const me = this;

    me.checkEdgeRemove(me._targetEdge);

    me._targetEdge = edge;

    // Utils.debugLog(`new edge target: ${edge.getFromId()} - ${edge.getToId()}`);

    me._sprite.play("rkn_walk");

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
        me._sprite.stop().setFrame(0);
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

  totalStop() {
    const me = this;

    if (!!me._movementTween) {
      me._movementTween.stop();
      me._movementTween = null;
    }

    me._sprite.stop().setFrame(0);
  }
}
