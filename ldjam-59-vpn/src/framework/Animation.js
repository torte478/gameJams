import Here from "./Here.js";

export default class Animation {
  static init() {
    Here._.anims.create({
      key: "tower_idle",
      frames: Animation.getFrames("tower", [1, 2, 3, 4]),
      frameRate: 8,
      repeat: -1,
    });

    Here._.anims.create({
      key: "tower_transform",
      frames: Animation.getFrames("tower", [1, 2, 3]),
      frameRate: 1,
      repeat: 0,
    });

    Here._.anims.create({
      key: "rkn_walk",
      frames: Animation.getFrames("rkn", [1, 2]),
      frameRate: 4,
      repeat: -1,
    });

    Here._.anims.create({
      key: "rkn_eat",
      frames: Animation.getFrames(
        "rkn",
        [3, 4, 5, 3, 4, 5, 3, 4, 5, 3, 4, 5, 0],
      ),
      frameRate: 6,
      repeat: 0,
    });
  }

  static getFrames(texture, frames) {
    return Here._.anims.generateFrameNames(texture, { frames: frames });
  }
}
