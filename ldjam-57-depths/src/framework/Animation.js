import Here from "./Here.js";

export default class Animation {
  static init() {
    // scene.anims.create({
    //     key: 'ANIM_NAME',
    //     frames: Animation.getFrames('ASSET_NAME', [ 1, 2, 3 ]),
    //     frameRate: 24,
    //     repeat: -1
    // });

    Here._.anims.create({
      key: "player_idle",
      frames: Animation.getFrames("player_idle", [0, 1]),
      frameRate: 2,
      repeat: -1,
    });

    Here._.anims.create({
      key: "player_walk",
      frames: Animation.getFrames(
        "player_walk",
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      ),
      frameRate: 24,
      repeat: -1,
    });
  }

  static getFrames(texture, frames) {
    return Here._.anims.generateFrameNames(texture, { frames: frames });
  }
}
