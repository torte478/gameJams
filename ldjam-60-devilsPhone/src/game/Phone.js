import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Config from "./Config.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";
import GUI from "./GUI.js";

export default class Phone {
  /** @type {Phaser.Math.Vector2} */
  _centerPos = new Phaser.Math.Vector2(500, 600);

  /** @type {Phaser.Math.Vector2} */
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

  /** @type {Phaser.GameObjects.Image[]} */
  _digits;

  /** @type {Phaser.GameObjects.Sprite[]} */
  _digitGates;

  /** @type {Phaser.GameObjects.Container} */
  _container;

  constructor(digitResolvedCallback, tubeClickCallback, thisObj) {
    const me = this;

    me._digitResolvedCallback = digitResolvedCallback;
    me._tubeClickCallback = tubeClickCallback;
    me._thisObj = thisObj;

    me._pointer = Here._.input.activePointer;

    me._background = Here._.add
      .image(0, 0, "phoneBack")
      .setScale(1.2)
      .setDepth(Consts.Depth.PhoneBack);

    me._frontSprite = Here._.add
      .image(0, 0, "phoneFront")
      .setDepth(Consts.Depth.PhoneFront);

    me._limiter = Here._.add
      .image(50, 100, "phoneLimiter")
      .setDepth(Consts.Depth.PhoneLimiter)
      .setOrigin(0, 0);

    me._buildPhoneTube();
    me._buildButtons(me);

    const containerChildren = [me._background];
    for (let i = 0; i < me._digits.length; ++i) {
      containerChildren.push(me._digits[i]);
      containerChildren.push(me._digitGates[i]);
    }

    containerChildren.push(me._frontSprite);
    containerChildren.push(me._limiter);
    containerChildren.push(me._phoneTubeSprite);

    me._container = Here._.add
      .container(me._centerPos.x, me._centerPos.y, containerChildren)
      .setDepth(0);
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

  closeGate(index) {
    const me = this;

    const i = me._getDigitArrayIndex(index);

    if (me._digitGates[i].isClosed) {
      return;
    }

    me._digitGates[i].play("digitGateClose");
    me._digitGates[i].isClosed = true;
  }

  openGate(index) {
    const me = this;

    const i = me._getDigitArrayIndex(index);

    if (!me._digitGates[i].isClosed) {
      return;
    }

    me._digitGates[i].play("digitGateOpen");
    me._digitGates[i].isClosed = false;
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

  finishLevelEnter(levelInfo) {
    const me = this;

    for (let i = 0; i < 10; ++i) {
      me.openGate(i);
    }

    me._container.setPosition(me._centerPos.x, me._centerPos.y);

    me._state = Enums.PhoneState.IDLE;
  }

  startLevelEnter(duration) {
    const me = this;

    const follower = { t: 0, vec: new Phaser.Math.Vector2() };
    const path = new Phaser.Curves.Path(me._centerPos.x, me._centerPos.y);
    path.circleTo(Config.Phone.WalkCurveCirlceRadius);
    path.moveTo(me._centerPos.x, me._centerPos.y);
    path.circleTo(Config.Phone.WalkCurveCirlceRadius, true, 180);

    Here._.tweens.add({
      targets: follower,
      t: 1,
      ease: "Linear",
      duration: duration,
      onUpdate: () => {
        const curvePos = path.getPoint(follower.t, follower.vec);
        me._container.setPosition(curvePos.x, curvePos.y);
      },
    });

    me._state = Enums.PhoneState.WALK;
  }

  _onDigitPointerDown(index) {
    const me = this;

    if (me._state === Enums.PhoneState.IDLE) {
      if (me._digitGates[index].isClosed) {
        return;
      }
      me._selectedIndex = index;
      me._startAngle = me._calcDeltaDeg();
      me._currentAngle = me._startAngle;
      me._state = Enums.PhoneState.DIGIT_SELECTED;
      return;
    }
  }

  _calcDeltaDeg() {
    const me = this;

    const mousePos = new Phaser.Math.Vector2(
      me._pointer.worldX - me._centerPos.x,
      me._pointer.worldY - me._centerPos.y,
    );

    const polarA = Math.atan2(me._inputDigitPos.y, me._inputDigitPos.x);
    const polarB = Math.atan2(mousePos.y, mousePos.x);
    const delta = polarA - polarB;
    const normalizedDelta =
      ((delta % Phaser.Math.PI2) + Phaser.Math.PI2) % Phaser.Math.PI2;
    return (normalizedDelta * 180) / Math.PI;
  }

  _buildButtons() {
    const me = this;

    const circle = new Phaser.Geom.Circle(0, 0, 120);
    const digitPositions = circle.getPoints(12);
    me._inputDigitPos = digitPositions[2];

    me._digits = [];
    me._digitGates = [];
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

      const digitGate = Here._.add
        .sprite(digitPos.x, digitPos.y, "tiles", 13)
        .setDepth(Consts.Depth.PhoneDigits + 10);

      digitGate.isClosed = false;

      me._digitGates.push(digitGate);
    }
  }

  _buildPhoneTube() {
    const me = this;

    me._phoneTubeSprite = Here._.add.image(0, -250, "phoneTube", 0);

    me._phoneTubeSprite.setInteractive();
    me._phoneTubeSprite.on("pointerover", () => {
      me._phoneTubeSprite.setFrame(1);
    });

    me._phoneTubeSprite.on("pointerout", () => {
      me._phoneTubeSprite.setFrame(0);
    });

    me._phoneTubeSprite.on("pointerdown", () => {
      me._onTubeClick();
    });
  }

  _onTubeClick() {
    const me = this;

    me._tubeClickCallback.call(me._thisObj);
  }

  _getDigitArrayIndex(index) {
    const me = this;

    const result = index - 1;
    return result < 0 ? 9 : result;
  }
}
