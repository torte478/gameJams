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

    Here._.anims.create({
      key: "player_at_spot",
      frames: Animation.getFrames("player_walk", [11]),
      frameRate: 1,
      repeat: -1,
    });

    Here._.anims.create({
      key: "mop_clean",
      frames: Animation.getFrames("hand", [5, 6, 5, 6, 4]),
      frameRate: 8,
    });

    Here._.anims.create({
      key: "mop_dirt",
      frames: Animation.getFrames("hand", [8, 9, 8, 9, 7]),
      frameRate: 8,
    });

    Here._.anims.create({
      key: "fire",
      frames: Animation.getFrames("fire", [0, 1]),
      frameRate: 3,
      repeat: -1,
    });

    Here._.anims.create({
      key: "boss",
      frames: Animation.getFrames("boss", [0, 0, 1, 2]),
      frameRate: 2,
      repeat: -1,
    });
  }

  static getFrames(texture, frames) {
    return Here._.anims.generateFrameNames(texture, { frames: frames });
  }
}
