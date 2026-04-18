import Signal from "./Signal.js";

export default class SignalPool {
  /** @type {Signal[]} */
  _pool = [];

  constructor() {
    const me = this;
  }

  create(fromTowerId, toTowerId) {
    const me = this;

    const signal = me._getOrCreateSignal();
    signal.init(fromTowerId, toTowerId);
    return signal;
  }

  release(signal) {
    const me = this;

    me._pool.push(signal);
  }

  _getOrCreateSignal() {
    const me = this;

    if (me._pool.length > 0) {
      const signal = me._pool[me._pool.length - 1];
      me._pool = me._pool.splice(me._pool.length - 1, 1);
      return signal;
    }

    const signal = new Signal();
    return signal;
  }
}
