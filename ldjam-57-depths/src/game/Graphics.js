import Here from "../framework/Here.js";
import Consts from "./Consts.js";

export default class Graphics {
  /** @type {Phaser.GameObjects.Particles.ParticleEmitter} */
  _spotEmitter;

  /** @type {Phaser.GameObjects.Particles.ParticleEmitter} */
  _waterEmmitter;

  /** @type {Phaser.GameObjects.Particles.ParticleEmitter} */
  _manaEmitter;

  constructor() {
    const me = this;

    me._spotEmitter = Here._.add
      .particles(0, 0, "particles", {
        frame: [0, 1, 2],
        lifespan: 500,
        speed: { min: 50, max: 200 },
        scale: { start: 0.8, end: 0 },
        emitting: false,
      })
      .setDepth(Consts.Depth.UpperPlayer);

    me._waterEmmitter = Here._.add
      .particles(0, 0, "particles", {
        frame: [6, 7],
        lifespan: 500,
        speed: { min: 50, max: 200 },
        scale: { start: 0.8, end: 0 },
        emitting: false,
      })
      .setDepth(Consts.Depth.UpperPlayer);

    me._manaEmitter = Here._.add
      .particles(0, 0, "particles", {
        frame: [6],
        lifespan: 500,
        speed: { min: 100, max: 300 },
        scale: { start: 0.8, end: 0 },
        emitting: false,
      })
      .setDepth(Consts.Depth.Max);
  }

  spotParticles(x, y) {
    const me = this;

    me._spotEmitter.explode(20, x, y);
  }

  waterParticles(x, y) {
    const me = this;

    me._waterEmmitter.explode(20, x, y);
  }

  manaParticles() {
    const me = this;

    me._manaEmitter.explode(
      40,
      Here._.cameras.main.scrollX + 50,
      Here._.cameras.main.scrollY + 50
    );
  }
}
