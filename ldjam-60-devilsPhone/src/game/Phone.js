import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Config from "./Config.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";
import GUI from "./GUI.js";

export default class Phone {
  /** @type {Phaser.Math.Vector2} */
  _inputDigitPos = new Phaser.Math.Vector2(500 + 175, 550 + 150);
  TODO;

  /** @type {Phaser.Math.Vector2} */
  _centerPos = new Phaser.Math.Vector2(500, 550);

  /** @type {Number | null} */
  _selectedIndex = null;

  /** @type {Number} */
  _state = Enums.PhoneState.IDLE;

  /** @type {Phaser.Input.Pointer} */
  _pointer;

  /** @type {Number} */
  _startAngle = NaN;

  /** @type {Number} */
  _currentAngle = NaN;

  /** @type {Phaser.GameObjects.Image} */
  _frontSprite;

  /** @type {GUI} */
  _gui;

  /**
   *
   * @param {GUI} gui
   */
  constructor(gui) {
    const me = this;

    me._gui = gui;

    me._pointer = Here._.input.activePointer;

    me._centerPos = new Phaser.Math.Vector2(500, 550);

    me._background = Here._.add
      .image(me._centerPos.x, me._centerPos.y, "phoneBack")
      .setScale(1.1)
      .setDepth(Consts.Depth.PhoneBack);
    me._frontSprite = Here._.add
      .image(me._centerPos.x, me._centerPos.y, "phoneFront")
      .setDepth(Consts.Depth.PhoneFront);
    me._limiter = Here._.add
      .image(me._centerPos.x + 130, me._centerPos.y + 200, "phoneLimiter")
      .setDepth(Consts.Depth.PhoneLimiter);

    const digitsPos = Utils.buildArray(10, null);
    digitsPos[0] = { x: +175, y: 0 };
    digitsPos[1] = { x: +150, y: -75 };
    digitsPos[2] = { x: +80, y: -150 };
    digitsPos[3] = { x: 0, y: -175 };
    digitsPos[4] = { x: -80, y: -150 };
    digitsPos[5] = { x: -160, y: -75 };
    digitsPos[6] = { x: -175, y: 0 };
    digitsPos[7] = { x: -160, y: +75 };
    digitsPos[8] = { x: -80, y: +150 };
    digitsPos[9] = { x: 0, y: +175 };

    me._digits = [];
    for (let i = 0; i < digitsPos.length; ++i) {
      if (digitsPos[i] === null) continue;
      const digit = Here._.add
        .image(
          me._centerPos.x + digitsPos[i].x,
          me._centerPos.y + digitsPos[i].y,
          "tiles",
          i,
        )
        .setDepth(Consts.Depth.PhoneDigits)
        .setInteractive(
          new Phaser.Geom.Circle(
            Consts.Unit.Small,
            Consts.Unit.Small,
            Consts.Unit.Small,
          ),
          Phaser.Geom.Circle.Contains,
        );

      // TODO: delete
      digit.on("pointerover", () => {
        digit.setTint(0x7878ff);
      });

      digit.on("pointerout", () => {
        digit.clearTint();
      });

      digit.on("pointerdown", () => {
        me._onDigitPointerDown(i);
      });

      me._digits.push(digit);
    }
  }

  update() {
    const me = this;

    if (me._state !== Enums.PhoneState.DIGIT_SELECTED) {
      return;
    }

    const nextAngle = me._calcDeltaDeg();
    const delta = me._currentAngle - nextAngle;
    if (delta > 0 && delta < Config.Phone.MaxAnglePerFrame) {
      me._frontSprite.setAngle(me._startAngle - nextAngle);
      me._currentAngle = nextAngle;
    }
  }

  onPointerUp() {
    const me = this;

    if (me._state === Enums.PhoneState.DIGIT_SELECTED) {
      const delta = Math.round((me._startAngle - me._currentAngle - 60) / 30); // 360 / 12 * 2
      Utils.debugLog("RES: " + delta);

      me._selectedIndex = null;
      me._startAngle = NaN;
      me._currentAngle = NaN;
      me._frontSprite.setAngle(0);

      me._state = Enums.PhoneState.IDLE;
      return;
    }
  }

  _onDigitPointerDown(index) {
    const me = this;

    if (me._state === Enums.PhoneState.IDLE) {
      me._selectedIndex = index;
      me._startAngle = me._calcDeltaDeg();
      me._currentAngle = me._startAngle;
      me._state = Enums.PhoneState.DIGIT_SELECTED;
      return;
    }
  }

  _calcDeltaDeg() {
    const me = this;

    const polarA = Math.atan2(
      me._inputDigitPos.y - me._centerPos.y,
      me._inputDigitPos.x - me._centerPos.y,
    );
    const polarB = Math.atan2(
      me._pointer.worldY - me._centerPos.y,
      me._pointer.worldX - me._centerPos.y,
    );
    const delta = polarA - polarB;
    const normalizedDelta =
      ((delta % Phaser.Math.PI2) + Phaser.Math.PI2) % Phaser.Math.PI2;
    return (normalizedDelta * 180) / Math.PI;
  }
}
