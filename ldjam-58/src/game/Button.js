import Here from "../framework/Here.js";

export default class Button {
  /** @type {Phaser.GameObjects.Image} */
  _image;

  /** @type {Boolean} */
  _isPressed = false;

  /** @type {Function} */
  _onPress;

  /** @type {Object} */
  _context;

  /**
   * @param {Number} x
   * @param {Number} y
   * @param {Number} frame
   * @param {Function} onClick
   * @param {Function} onPress
   * @param {Function} onCancel
   * @param {Object} context
   */
  constructor(x, y, frame, onClick, onPress, onCancel, context) {
    const me = this;

    me._onPress = onPress;
    me._context = context;

    me._image = Here._.add
      .image(x, y, "buttons", frame)
      .setInteractive()
      .setScrollFactor(0, 0);

    me._image.on(
      "pointerover",
      (p) => {
        me._image.setScale(1.25);
      },
      me
    );

    me._image.on(
      "pointerout",
      (p) => {
        me._image.setScale(1);
        me._isPressed = false;
        me._image.clearTint();

        if (!!onCancel) onCancel.call(context);
      },
      me
    );

    me._image.on(
      "pointerdown",
      (p) => {
        me._isPressed = true;
        me._image.setTint(0xff0000);

        if (!!onClick) onClick.call(context);
      },
      me
    );

    me._image.on(
      "pointerup",
      (p) => {
        me._isPressed = false;
        me._image.clearTint();

        if (!!onCancel) onCancel.call(context);
      },
      me
    );
  }

  update() {
    const me = this;

    if (me._isPressed && !!me._onPress) {
      me._onPress.call(me._context);
    }
  }

  isPressed() {
    const me = this;

    return me._isPressed;
  }
}
