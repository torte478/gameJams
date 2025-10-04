import Here from "../framework/Here.js";
import Enums from "./Enums.js";

export default class Transport {
  _maxSpeed;
  _accelerationTime;
  _decelerationTime;

  //---- state

  /** @type {Number} */
  _accelerationProgress = 0;

  _currentMovementDirection = 0;

  constructor(maxSpeed, accelerationTime, decelerationTime) {
    const me = this;

    me._maxSpeed = maxSpeed;
    me._accelerationTime = accelerationTime;
    me._decelerationTime = decelerationTime;
  }

  getVelocity(deltaTime) {
    const me = this;

    let pressedDirection = 0;
    if (Here.Controls.isPressing(Enums.Keyboard.RIGHT)) pressedDirection = 1;
    else if (Here.Controls.isPressing(Enums.Keyboard.LEFT))
      pressedDirection = -1;

    const isAcceleration =
      pressedDirection !== 0 &&
      (me._currentMovementDirection === 0 ||
        pressedDirection === me._currentMovementDirection);

    let velocityX = 0;
    if (isAcceleration) {
      me._currentMovementDirection = pressedDirection;

      me._accelerationProgress = Math.min(
        1,
        me._accelerationProgress + deltaTime / 1000 / me._accelerationTime
      );
      const easeOut = 1 - Math.pow(1 - me._accelerationProgress, 2);
      velocityX = easeOut * me._maxSpeed;
    } else {
      me._accelerationProgress = Math.max(
        0,
        me._accelerationProgress - deltaTime / 1000 / me._decelerationTime
      );
      const easeIn = Math.pow(me._accelerationProgress, 2);
      velocityX = easeIn * me._maxSpeed;

      if (me._accelerationProgress === 0) {
        velocityX = 0;
        me._currentMovementDirection = 0;
      }
    }

    return velocityX * me._currentMovementDirection;
  }
}
