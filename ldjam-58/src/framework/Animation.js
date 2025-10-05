import Here from "./Here.js";

// TODO: to base
export default class Animation {
  static init() {
    Animation._internalInit("gnome", "idle", [0, 1], 1.5, -1);
    Animation._internalInit("gnome", "walk", [2, 3], 3.5, -1);
    Animation._internalInit("gnome", "sleep", [4, 5], 1, -1);
    Animation._internalInit("gnome", "wonder", [6, 7], 8, -1);
    Animation._internalInit("gnome", "skate_idle", [8, 9], 1.5, -1);
    Animation._internalInit("gnome", "skate_walk", [10, 11], 5, -1);
    Animation._internalInit("gnome", "death_wall", [12], 1, 0);
    Animation._internalInit("gnome", "nothing", [13], 1, 0);

    Animation._internalInit("car", "ride", [0, 1], 16, -1);

    Animation._internalInit("old", "walk", [0, 1], 12, -1);
  }

  static _getFrames(texture, frames) {
    return Here._.anims.generateFrameNames(texture, { frames: frames });
  }

  static _internalInit(texture, key, frames, frameRate, repeate) {
    const animationName = `${texture}_${key}`;
    if (Here._.anims.exists(animationName)) return;

    Here._.anims.create({
      key: animationName,
      frames: Animation._getFrames(texture, frames),
      frameRate: frameRate,
      repeat: repeate,
    });
  }
}
