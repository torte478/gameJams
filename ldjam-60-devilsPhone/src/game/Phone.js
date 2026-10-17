import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Config from "./Config.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";
import GUI from "./GUI.js";

export default class Phone {
  /** @type {Phaser.Math.Vector2} */
  _centerPos = new Phaser.Math.Vector2(500, 550);

  _inputDigitPos;

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

  /** @type {Object} */
  _thisObj;

  /** @type {Phaser.GameObjects.Image} */
  _phoneTubeSprite;

  /** @type {Function} */
  _digitResolvedCallback;

  /** @type {Function} */
  _tubeClickCallback;

  constructor(digitResolvedCallback, tubeClickCallback, thisObj) {
    const me = this;

    me._digitResolvedCallback = digitResolvedCallback;
    me._tubeClickCallback = tubeClickCallback;
    me._thisObj = thisObj;

    me._pointer = Here._.input.activePointer;

    me._background = Here._.add
      .image(me._centerPos.x, me._centerPos.y, "phoneBack")
      .setScale(1)
      .setDepth(Consts.Depth.PhoneBack);

    me._frontSprite = Here._.add
      .image(me._centerPos.x, me._centerPos.y, "phoneFront")
      .setDepth(Consts.Depth.PhoneFront);

    me._limiter = Here._.add
      .image(550, 650, "phoneLimiter")
      .setDepth(Consts.Depth.PhoneLimiter)
      .setOrigin(0, 0);

    me._buildPhoneTube();
    me._buildButtons(me);
  }

  update(deltaTime) {
    const me = this;

    if (me._state === Enums.PhoneState.DIGIT_SELECTED) {
      const nextAngle = me._calcDeltaDeg();
      const delta = me._currentAngle - nextAngle;
      if (delta > 0 && delta < Config.Phone.MaxAnglePerFrame) {
        me._frontSprite.setAngle(me._startAngle - nextAngle);
        me._currentAngle = nextAngle;
      }
      return;
    }

    if (me._state === Enums.PhoneState.ROLLBACK) {
      const currentAngle =
        me._frontSprite.angle >= 0
          ? me._frontSprite.angle
          : me._frontSprite.angle + 360;
      const nextAngle = currentAngle - Config.Phone.RollbackSpeed * deltaTime;
      me._frontSprite.setAngle(nextAngle);

      if (nextAngle < 0) {
        me._frontSprite.setAngle(0);
        me._state = Enums.PhoneState.IDLE;
      }
      return;
    }
  }

  onPointerUp() {
    const me = this;

    if (me._state === Enums.PhoneState.DIGIT_SELECTED) {
      const sectorSize = 360 / 12;
      const digitResolvedOffset = 2 * sectorSize;

      const digit =
        Math.round(
          (me._startAngle - me._currentAngle - digitResolvedOffset) /
            sectorSize,
        ) + 1;

      const normalizedDigit = digit == 10 ? 0 : digit;
      me._digitResolvedCallback.call(me._thisObj, normalizedDigit);

      me._startAngle = NaN;
      me._currentAngle = NaN;
      me._selectedIndex = NaN;
      me._state = Enums.PhoneState.ROLLBACK;
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
      me._inputDigitPos.x - me._centerPos.x,
    );
    const polarB = Math.atan2(
      me._pointer.worldY - me._centerPos.y,
      me._pointer.worldX - me._centerPos.x,
    );
    const delta = polarA - polarB;
    const normalizedDelta =
      ((delta % Phaser.Math.PI2) + Phaser.Math.PI2) % Phaser.Math.PI2;
    return (normalizedDelta * 180) / Math.PI;
  }

  _buildButtons() {
    const me = this;

    const circle = new Phaser.Geom.Circle(
      me._centerPos.x,
      me._centerPos.y,
      160,
    );
    const digitPositions = circle.getPoints(12);
    me._inputDigitPos = digitPositions[2];
    Utils.debugLog(me._inputDigitPos);

    me._digits = [];
    for (let i = 0; i < 10; ++i) {
      const index = i == 0 ? 0 : 12 - i;
      const digitPos = digitPositions[index];

      const digitValue = i == 9 ? 0 : i + 1;
      const digit = Here._.add
        .image(digitPos.x, digitPos.y, "tiles", digitValue)
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

  _buildPhoneTube() {
    const me = this;

    me._phoneTubeSprite = Here._.add.image(
      me._centerPos.x,
      me._centerPos.y - 300,
      "phoneTube",
    );

    me._phoneTubeSprite.setInteractive();
    me._phoneTubeSprite.on("pointerover", () => {
      me._phoneTubeSprite.setTint(0x7878ff);
    });

    me._phoneTubeSprite.on("pointerout", () => {
      me._phoneTubeSprite.clearTint();
    });

    me._phoneTubeSprite.on("pointerdown", () => {
      me._onTubeClick();
    });
  }

  _onTubeClick() {
    const me = this;

    me._tubeClickCallback.call(me._thisObj);
  }
}
