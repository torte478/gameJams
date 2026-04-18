import Utils from "../framework/Utils.js";
import Config from "./Config.js";
import Signal from "./Signal.js";
import Tower from "./Tower.js";

export default class Edge {
  /** @type {Tower} */
  _from;

  /** @type {Tower} */
  _to;

  /** @type {Signal | null} */
  _signal = null;

  /** @type {Boolean} */
  _isDirect = true;

  /** @type {Number} */
  _lerpT = 0;

  constructor(from, to) {
    const me = this;

    me._from = from;
    me._to = to;
  }

  /**
   *
   * @param {Number} from
   * @param {Number} to
   * @returns
   */
  thisIsIt(from, to) {
    const me = this;
    const exists =
      (me._from.id === from && me._to.id === to) ||
      (me._from.id === to && me._to.id === from);
    return exists;
  }

  updateSignals(deltaTime) {
    const me = this;

    if (!me._signal) {
      return;
    }

    me._lerpT += (deltaTime / 1000) * Config.Speed.Signal;
    const signalPos = Phaser.Math.LinearXY(
      me._getFromPos(),
      me._getToPos(),
      me._lerpT,
    );
    me._signal.toGameObj().setPosition(signalPos.x, signalPos.y);

    if (me._lerpT >= 1.0) {
      throw "Arrived!";
    }
  }

  isFree() {
    const me = this;

    return !me._signal;
  }

  /**
   * @param {Number} fromTowerId
   * @param {Signal} signal
   */
  sendSignal(fromTowerId, signal) {
    const me = this;

    if (!me.isFree) {
      throw "edge is not free!";
    }

    me._signal = signal;
    me._isDirect = fromTowerId === me._from.id;

    const fromPos = me._getFromPos();
    me._signal.toGameObj().setVisible(true).setPosition(fromPos.x, fromPos.y);
    me._lerpT = 0;
  }

  _getFromPos() {
    const me = this;

    const tower = me._isDirect ? me._from : me._to;
    return Utils.toPoint(tower.toGameObj());
  }

  _getToPos() {
    const me = this;

    const tower = !me._isDirect ? me._from : me._to;
    return Utils.toPoint(tower.toGameObj());
  }
}
