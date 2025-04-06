import Here from "../framework/Here.js";
import Consts from "./Consts.js";

export default class Graphics {
  /** @type {Phaser.GameObjects.Particles.ParticleEmitter} */
  _spotEmitter;

  /** @type {Phaser.GameObjects.Particles.ParticleEmitter} */
  _waterEmmitter;

  /** @type {Phaser.GameObjects.Particles.ParticleEmitter} */
  _manaEmitter;

  /** @type {Phaser.GameObjects.Particles.ParticleEmitter} */
  _fireEmitter;

  /** @type {Phaser.GameObjects.Particles.ParticleEmitter} */
  _fireballExplostionEmitter;

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

    me._fireEmitter = Here._.add
      .particles(0, 0, "particles", {
        frame: [3, 4, 5],
        lifespan: 1000,
        speed: { min: 50, max: 100 },
        scale: { start: 1, end: 0 },
        angle: { min: -120, max: -60 },
      })
      .setDepth(Consts.Depth.UI);

    me._fireEmitter.stop();

    me._fireballExplostionEmitter = Here._.add
      .particles(0, 0, "particles", {
        frame: [3, 4, 5],
        lifespan: 500,
        speed: { min: 50, max: 500 },
        scale: { start: 0.8, end: 0 },
        emitting: false,
      })
      .setDepth(Consts.Depth.UpperPlayer);
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

  explosion(x, y) {
    const me = this;

    me._fireballExplostionEmitter.explode(400, x, y);
  }
}
