import Here from "./Here.js";

export default class Animation {
  static init() {
    Here._.anims.create({
      key: "level1_cross",
      frames: Animation.getFrames("level1_anim", [0, 1, 2, 3]),
      frameRate: 8,
      repeat: -1,
    });

    Here._.anims.create({
      key: "level1_nougth",
      frames: Animation.getFrames("level1_anim", [4, 5, 6, 7]),
      frameRate: 8,
      repeat: -1,
    });

    Here._.anims.create({
      key: "level3_x",
      frames: Animation.getFrames("level3", [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2]),
      frameRate: 12,
      repeat: -1,
    });

    Here._.anims.create({
      key: "level3_o",
      frames: Animation.getFrames("level3", [3, 3, 3, 3, 3, 3, 3, 3, 3, 4, 5]),
      frameRate: 12,
      repeat: -1,
    });
  }

  static getFrames(texture, frames) {
    return Here._.anims.generateFrameNames(texture, { frames: frames });
  }
}
