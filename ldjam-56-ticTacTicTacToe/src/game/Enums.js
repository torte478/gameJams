export default class Enums {
  static Keyboard = {
    CANCEL: 0,
    RESTART: 1,
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
    DRAW: 100,
  };

  static Difficulty = {
    DEBUG: 0,
    EASY: 1,
    NORMAL: 2,
    HARD: 3,
  };

  static BonusState = {
    NONE: 0,
    DOUBLE_CLICK: 1,
    SWAP: 2,
    SUPER_X: 3,
  };
}
