import Here from "./Here.js";

// TODO: to base
export default class Animation {
  static init() {
    Animation._init("gnome", "idle", [0, 1], 1.5, -1);
    Animation._init("gnome", "walk", [2, 3], 3.5, -1);
    Animation._init("gnome", "sleep", [4, 5], 1, -1);
    Animation._init("gnome", "wonder", [6, 7], 8, -1);
    Animation._init("gnome", "skate_idle", [8, 9], 1.5, -1);
    Animation._init("gnome", "skate_walk", [10, 11], 5, -1);
    Animation._init("gnome", "death_wall", [12], 1, 0);
  }

  static _getFrames(texture, frames) {
    return Here._.anims.generateFrameNames(texture, { frames: frames });
  }

  static _init(texture, key, frames, frameRate, repeate) {
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
