import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Config from "./Config.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";
import MyStaticTime from "./MyStaticTime.js";

export default class Player {
  /** @type {Phaser.GameObjects.Container} */
  _container;

  /** @type {Phaser.GameObjects.Sprite} */
  _sprite;

  /** @type {Phaser.GameObjects.Sprite} */
  _hand;

  /** @type {Number} */
  _garbageCount = 0;

  /** @type {Phaser.Geom.Point} */
  _previousMovementVector = Player._zeroVector;

  _nextStepSpotTimeSec = -1;
  _spotStepCount = 0;

  static _zeroVector = Utils.buildPoint(0, 0);

  _nextSpotProblemAudioPlayTime = 0;

  constructor() {
    const me = this;

    me._sprite = Here._.add.sprite(5, 0, "player_idle", 0);
    me._hand = Here._.add.sprite(50, 50, "hand", 0).setDepth(Consts.Depth.UI);
    me._previousMovementVector = me._container = Here._.add
      .container(Config.Start.PlayerX, Config.Start.PlayerY, [
        me._sprite,
        me._hand,
      ])
      .setSize(Consts.Unit.Normal, Consts.Unit.Normal);

    Here._.physics.world.enable(me._container);
    /** @type {Phaser.Physics.Arcade.Body} */
    const body = me._container.body;

    body.setBounce(1, 1).setCircle(30);

    Here._.input.on("pointermove", me._onPointerMove, me);
  }

  update(deltaSec) {
    const me = this;

    return me._updateMovement();
  }

  toGameObject() {
    const me = this;

    return me._container;
  }

  toMousePos() {
    const me = this;

    return Utils.buildPoint(
      me._container.x + me._hand.x,
      me._container.y + me._hand.y
    );
  }

  _onPointerMove(pointer) {
    const me = this;

    if (!Here._.input.mouse.locked) return;

    me._hand.x += pointer.movementX;
    me._hand.y += pointer.movementY;

    const distance = Math.sqrt(
      me._hand.x * me._hand.x + me._hand.y * me._hand.y
    );
    const maxDistance = 100;
    if (distance > maxDistance) {
      const ratio = maxDistance / distance;
      me._hand.setPosition(me._hand.x * ratio, me._hand.y * ratio);
    }
  }

  _updateMovement() {
    const me = this;

    const body = me._container.body;
    let dx = 0;
    let dy = 0;
    if (Here.Controls.isPressing(Enums.Keyboard.LEFT)) dx = -1;
    if (Here.Controls.isPressing(Enums.Keyboard.RIGHT)) dx = +1;
    if (Here.Controls.isPressing(Enums.Keyboard.UP)) dy = -1;
    if (Here.Controls.isPressing(Enums.Keyboard.DOWN)) dy = +1;

    const otherBodies = Here._.physics.overlapRect(
      me._container.x - 25,
      me._container.y + 25,
      50,
      25,
      false,
      true
    );

    let speed = Config.Player.Speed;
    const spot = Utils.firstOrNull(otherBodies, (f) => !!f.gameObject.isSpot);
    const isSpot = !!spot;
    const isGarbage = Utils.any(otherBodies, (f) => !!f.gameObject.isGarbage);

    if (isSpot) {
      speed = Config.Player.SpotSpeed;

      if (!spot.gameObject.isStep) {
        me._nextStepSpotTimeSec = MyStaticTime.time;
        me._spotStepCount = 0;

        if (MyStaticTime.time > me._nextSpotProblemAudioPlayTime) {
          Here._.sound.play("spot_problem");
          me._nextSpotProblemAudioPlayTime = MyStaticTime.time + 0.75;
        }
      }
      me._sprite.play("player_at_spot", true);
    } else if (isGarbage) {
      speed = Config.Player.GarbageSpeed;
    }

    if (dx === 0 && dy === 0) {
      if (isSpot) {
        body.setVelocity(
          me._previousMovementVector.x * speed,
          me._previousMovementVector.y * speed
        );
      } else {
        me._previousMovementVector = Player._zeroVector;
        body.setVelocity(0, 0);
        me._sprite.play("player_idle", true);
      }
      return null;
    }

    if (dx !== 0 && dy !== 0) {
      const normalizeFactor = Math.sqrt(2) / 2;
      dx *= normalizeFactor;
      dy *= normalizeFactor;
    }

    body.setVelocity(dx * speed, dy * speed);
    me._previousMovementVector = Utils.buildPoint(dx, dy);

    let stepAngle = null;
    if (!isSpot) {
      me._sprite.play("player_walk", true);

      const needDrawStep =
        me._nextStepSpotTimeSec > 0 &&
        me._spotStepCount < Config.Player.StepSpotCount &&
        MyStaticTime.time > me._nextStepSpotTimeSec;
      if (needDrawStep) {
        stepAngle = Phaser.Math.RadToDeg(
          Phaser.Math.Angle.Between(0, 0, dx, dy)
        );
        me._spotStepCount += 1;
        me._nextStepSpotTimeSec =
          me._spotStepCount < Config.Player.StepSpotCount
            ? MyStaticTime.time + Config.Player.StepSpotIntervalSec
            : -1;
      }
    }

    return stepAngle;
  }
}
