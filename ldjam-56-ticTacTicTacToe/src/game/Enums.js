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

  static Cells = {
    LU: 0,
    U: 1,
    RU: 2,
    L: 3,
    C: 4,
    R: 5,
    LD: 6,
    D: 7,
    RD: 8,
  };

  static Side = {
    NONE: 0,
    CROSS: 1,
    NOUGHT: -1,
  };

  static Difficulty = {
    EASY: 0,
    NORMAL: 1,
    HARD: 2,
  };
}
