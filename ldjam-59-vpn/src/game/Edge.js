import Utils from "../framework/Utils.js";
import Config from "./Config.js";
import Signal from "./Signal.js";
import SignalPool from "./SignalPool.js";
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
  _distance;

  /** @type {Number} */
  _totalSignalDurationMs;

  /** @type {Number} */
  _currentSignalDurationMs;

  /** @type {SignalPool} */
  _signalPool;

  /** @type {Number} */
  _signalCounter = 0;

  /**
   * @param {Tower} from
   * @param {Tower} to
   */
  constructor(from, to, signalPool) {
    const me = this;

    me._from = from;
    me._to = to;
    me._signalPool = signalPool;

    me._distance = Phaser.Math.Distance.BetweenPoints(
      from.getPos(),
      to.getPos(),
    );

    const signalSpeed = Utils.getSpeedMaybeQuick(Config.Speed.Signal);
    me._totalSignalDurationMs = me._distance / (signalSpeed / 1000);
  }

  getFromId() {
    const me = this;

    return me._from.id;
  }

  getFromPos() {
    const me = this;

    return me._from.getPos();
  }

  getToId() {
    const me = this;

    return me._to.id;
  }

  getToPos() {
    const me = this;

    return me._to.getPos();
  }

  /**
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

  startFinalBossSequence() {
    const me = this;

    me._removeSignalIfExists();
  }

  updateSignals(deltaTime) {
    const me = this;

    if (!me._signal) {
      return;
    }

    const fromPos = me._getFromPos();
    const toPos = me._getToPos();

    me._currentSignalDurationMs += deltaTime;
    if (me._currentSignalDurationMs >= me._totalSignalDurationMs) {
      return me._completeSignal();
    }

    const progress = me._currentSignalDurationMs / me._totalSignalDurationMs;
    const signalPos = Phaser.Math.LinearXY(fromPos, toPos, progress);
    me._signal.toGameObj().setPosition(signalPos.x, signalPos.y);
  }

  isFree() {
    const me = this;

    return !me._signal;
  }

  resetRate() {
    const me = this;

    me._signalCounter = 0;
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
    me._signalCounter++;
    me._isDirect = fromTowerId === me._from.id;

    const fromPos = me._getFromPos();
    me._signal.toGameObj().setVisible(true).setPosition(fromPos.x, fromPos.y);
    me._currentSignalDurationMs = 0;
  }

  getMiddle() {
    const me = this;

    const from = me._from.getPos();
    const to = me._to.getPos();

    return Utils.buildPoint((from.x + to.x) / 2, (from.y + to.y) / 2);
  }

  hasSignalAtMiddle() {
    const me = this;

    if (!me._signal) return false;

    const middlePos = me.getMiddle();
    const signalPos = me._signal.getPos();

    return (
      Phaser.Math.Distance.BetweenPoints(signalPos, middlePos) <
      Config.EatSignalRadius
    );
  }

  signalEaten() {
    const me = this;

    me._removeSignalIfExists();
  }

  remove() {
    const me = this;

    me._removeSignalIfExists();
  }

  /**
   * @param {Edge} other
   */
  equalTo(other) {
    const me = this;

    return me.thisIsIt(other._from.id, other._to.id);
  }

  _removeSignalIfExists() {
    const me = this;

    if (!me._signal) return;

    me._signalPool.release(me._signal);
    me._signal = null;
  }

  _completeSignal() {
    const me = this;

    const tower = me._isDirect ? me._to : me._from;
    tower.addSignal(me._signal);
    me._signal = null;
  }

  _getFromPos() {
    const me = this;

    const tower = me._isDirect ? me._from : me._to;
    return tower.getPos();
  }

  _getToPos() {
    const me = this;

    const tower = !me._isDirect ? me._from : me._to;
    return tower.getPos();
  }
}
