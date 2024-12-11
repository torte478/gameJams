import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Consts from "./Consts.js";

export default class Cursor {
  /** @type {Phaser.GameObjects.Image} */
  _cursor;

  constructor() {
    const me = this;

    me._cursor = Here._.add
      .image(
        Consts.Viewport.Width / 2,
        Consts.Viewport.Height / 2,
        "placeholder40",
        0
      )
      .setDepth(Consts.Depth.Max);

    Here._.input.on(
      "pointerdown",
      (_) => {
        Here._.input.mouse.requestPointerLock();
      },
      me
    );

    Here._.input.on(
      "pointermove",
      (p) => {
        /** @type {Phaser.Input.Pointer} */
        const pointer = p;
        if (!pointer.locked) {
          return;
        }

        const camera = Here._.cameras.main;

        me._cursor.setPosition(
          Phaser.Math.Clamp(
            me._cursor.x + pointer.movementX,
            camera.worldView.x,
            camera.worldView.x + camera.worldView.width
          ),
          Phaser.Math.Clamp(
            me._cursor.y + pointer.movementY,
            camera.worldView.y,
            camera.worldView.y + camera.worldView.height
          )
        );
      },
      me
    );
  }

  getPos() {
    const me = this;
    return Utils.toPoint(me._cursor);
  }
}
