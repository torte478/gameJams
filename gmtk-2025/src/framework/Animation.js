import Here from "./Here.js";

export default class Animation {
  static init() {
    // Here._.anims.create({
    //   key: "fire_line",
    //   frames: Animation.getFrames("gun", [5, 6]),
    //   frameRate: 48,
    //   repeat: -1,
    // });
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
