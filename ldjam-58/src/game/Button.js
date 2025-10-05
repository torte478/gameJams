import Here from "../framework/Here.js";
import Consts from "./Consts.js";

export default class Button {
  /** @type {Phaser.GameObjects.Image} */
  _image;

  _isEnabled = true;

  /**
   * @param {Number} x
   * @param {Number} y
   * @param {Number} frame
   * @param {Function} onClick
   * @param {Function} onPress
   * @param {Function} onCancel
   * @param {Object} context
   */
  constructor(x, y, frame, onClick, context) {
    const me = this;

    me._image = Here._.add
      .image(x, y, "buttons", frame)
      .setInteractive()
      .setScrollFactor(0, 0)
      .setDepth(Consts.Depth.Button);

    me._image.on(
      "pointerover",
      (p) => {
        if (!me._isEnabled) return;

        me._image.setScale(1.25);
      },
      me
    );

    me._image.on(
      "pointerout",
      (p) => {
        if (!me._isEnabled) return;

        me._image.setScale(1);
        me._image.clearTint();
      },
      me
    );

    me._image.on(
      "pointerdown",
      (p) => {
        if (!me._isEnabled) return;

        if (!!onClick) onClick.call(context);
        me._image.setTint(0xffff00);
      },
      me
    );

    me._image.on(
      "pointerup",
      (p) => {
        if (!me._isEnabled) return;

        me._isPressed = false;
        me._image.clearTint();
      },
      me
    );
  }

  setVisible(visible) {
    const me = this;

    me._image.setVisible(visible);
    return me;
  }

  setEnable(enable) {
    const me = this;

    me._isEnabled = enable;
    me._image.setAlpha(me._isEnabled ? 1 : 0.5);

    return me;
  }
}
