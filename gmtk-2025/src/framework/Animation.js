import Here from "./Here.js";

export default class Animation {
  static init() {
    Here._.anims.create({
      key: "sword_attack",
      frames: Animation.getFrames("sword", [0, 1, 2, 3, 4]),
      frameRate: 24,
      repeat: 0,
    });
    // Here._.anims.create({
    //   key: "fire_blast",
    //   frames: Animation.getFrames("gun", [7, 8]),
    //   frameRate: 48,
    //   repeat: -1,
    // });
  }

  static getFrames(texture, frames) {
    return Here._.anims.generateFrameNames(texture, { frames: frames });
  }
}
