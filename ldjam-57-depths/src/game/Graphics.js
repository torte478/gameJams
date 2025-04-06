import Here from "../framework/Here.js";
import Consts from "./Consts.js";

export default class Graphics {
  /** @type {Phaser.GameObjects.Particles.ParticleEmitter} */
  _spotEmitter;

  constructor() {
    const me = this;

    me._spotEmitter = Here._.add
      .particles(0, 0, "spot_particles", {
        frame: [0, 1, 2, 3],
        lifespan: 500,
        speed: { min: 50, max: 200 },
        scale: { start: 0.8, end: 0 },
        emitting: false,
      })
      .setDepth(Consts.Depth.UpperPlayer);
  }

  spotParticles(x, y) {
    const me = this;

    console.log("particle");

    me._spotEmitter.explode(20, x, y);
  }
}
