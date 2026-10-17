import Here from "./Here.js";

export default class Animation {
  static init() {
    Here._.anims.create({
      key: "digitGateClose",
      frames: Animation.getFrames("tiles", [12, 11, 10]),
      frameRate: 4,
      repeat: 0,
    });

    Here._.anims.create({
      key: "digitGateOpen",
      frames: Animation.getFrames("tiles", [10, 11, 12, 13]),
      frameRate: 4,
      repeat: 0,
    });
  }

  static getFrames(texture, frames) {
    return Here._.anims.generateFrameNames(texture, { frames: frames });
  }
}
