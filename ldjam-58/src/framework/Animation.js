import Here from "./Here.js";

export default class Animation {
  static init() {
    Here._.anims.create({
      key: "gnome_idle",
      frames: Animation.getFrames("gnome", [0, 1]),
      frameRate: 3,
      repeat: -1,
    });
  }

  static getFrames(texture, frames) {
    return Here._.anims.generateFrameNames(texture, { frames: frames });
  }
}
