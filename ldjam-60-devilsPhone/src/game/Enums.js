export default class Enums {
  static Keyboard = {
    LEFT: 0,
    RIGHT: 1,
    UP: 2,
    DOWN: 3,

    MAIN_ACTION: 4,
    SECOND_ACTION: 5,

    RESTART: 6,
  };

  static GameState = {
    MAIN_MENU: 0,
    LEVEL: 1,
  };

  static PhoneState = {
    IDLE: 0,
    DIGIT_SELECTED: 1,
    ROLLBACK: 2,
  };
}
