import Here from "../framework/Here.js";
import Button from "./Button.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";

export default class Transport {
  _maxSpeed;
  _accelerationTime;
  _decelerationTime;

  //---- state

  /** @type {Number} */
  _accelerationProgress = 0;

  _currentMovementDirection = 0;

  constructor(shelfsPerSecond, accelerationTime, decelerationTime) {
    const me = this;

    me._maxSpeed = shelfsPerSecond * Consts.Shelf.Width;
    me._accelerationTime = accelerationTime;
    me._decelerationTime = decelerationTime;
  }

  /**
   * @param {Number} deltaTime
   * @returns {Number}
   */
  getVelocity(deltaTime, transport) {
    const me = this;

    let pressedDirection = 0;
    if (Here.Controls.isPressing(Enums.Keyboard.RIGHT)) {
      pressedDirection = 1;
    } else if (
      Here.Controls.isPressing(Enums.Keyboard.LEFT) &&
      transport != Enums.Transport.Rocket
    ) {
      pressedDirection = -1;
    }

    const isAcceleration =
      pressedDirection !== 0 &&
      (me._currentMovementDirection === 0 ||
        pressedDirection === me._currentMovementDirection);

    if (isAcceleration) {
      me._currentMovementDirection = pressedDirection;

      me._accelerationProgress = Math.min(
        1,
        me._accelerationProgress + deltaTime / 1000 / me._accelerationTime
      );
    } else {
      me._accelerationProgress = Math.max(
        0,
        me._accelerationProgress - deltaTime / 1000 / me._decelerationTime
      );

      if (me._accelerationProgress === 0) {
        me._currentMovementDirection = 0;
      }
    }

    return (
      me._accelerationProgress *
      me._maxSpeed *
      me._currentMovementDirection *
      (deltaTime / 1000)
    );
  }
}
