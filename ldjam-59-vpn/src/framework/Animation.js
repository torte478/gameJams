import Here from "./Here.js";

export default class Animation {
  static init() {
    Here._.anims.create({
      key: "tower_transform",
      frames: Animation.getFrames("tower", [0, 1, 2]),
      frameRate: 1,
      repeat: 0,
    });
  }

  static getFrames(texture, frames) {
    return Here._.anims.generateFrameNames(texture, { frames: frames });
  }
}
