import Here from "../framework/Here.js";
import UI from "./UI.js";

export default class VFX {
  /** @type {Phaser.Math.Vector2[]} */
  _towerPositions;

  /** @type {Number} */
  _index = 0;

  /** @type {UI} */
  _ui;

  /** @type {Boolean} */
  _isSpawing = false;

  constructor(ui) {
    const me = this;

    me._ui = ui;

    me._emitter = Here._.add.particles(0, 0, "bullet", {
      lifespan: 2000,
      speed: 400, //{ min: 400, max: 400 },
      emitting: false,
    });
  }

  tryShotBoss() {
    const me = this;

    if (!me._isSpawing || me._ui._score <= 0) return 0;

    const pos = me._towerPositions[me._index];
    me._index = (me._index + 1) % me._towerPositions.length;

    me._emitter.emitParticleAt(pos.x, pos.y, 1);

    me._ui.decrementScore();

    return 1;
  }

  startSpawn(towerPositions, bulletCount) {
    const me = this;

    me._towerPositions = towerPositions;
    me._index = 0;
    me._isSpawing = true;
  }
}
