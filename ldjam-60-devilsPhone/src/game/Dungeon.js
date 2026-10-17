import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Consts from "./Consts.js";

export default class Dungeon {
  /** @type {Phaser.GameObjects.Container} */
  _container;

  constructor() {
    const me = this;

    const sprite = Here._.add.image(0, 0, "dungeon");

    me._container = Here._.add
      .container(500, 400, [sprite])
      .setDepth(Consts.Depth.Background);
  }

  moveToNextRoom(duration, toMenu) {
    const me = this;

    let scaleValues = [4, 0.33];
    let alphaValues = [1, 0];
    if (toMenu) {
      scaleValues = Utils.reverse(scaleValues);
      alphaValues = Utils.reverse(alphaValues);
    }

    me._container.setScale(1).setAlpha(1);
    Here._.add.tween({
      targets: me._container,
      scale: scaleValues[0],
      alpha: alphaValues[0],
      duration: duration / 2,
      ease: "Sine.easeInOut",
      onComplete: () => {
        me._container.setScale(scaleValues[1]).setAlpha(alphaValues[1]);

        Here._.add.tween({
          targets: me._container,
          scale: 1,
          alpha: 1,
          duration: duration / 2,
          ease: "Sine.easeInOut",
        });
      },
    });
  }
}
