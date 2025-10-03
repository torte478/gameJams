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

  static Samples = {
    CRASH: 0,
    TOM: 1,
    SNARE: 2,
    KICK: 3,
  };

  static SampleCommands = {
    ATTACK: 0,
    TURN: 1,
    SHIELD: 2,
    WALK: 3,
  };

  static LevelObjectTypes = {
    SPIKES: 0,
    GUN: 1,
    TRAMPOLINE: 2,
    GOOD_BARREL: 3,
    BAD_BARREL: 4,
    TEMP_PLATFORM: 5,
  };

  static BitResult = {
    NONE: 0,
    DEATH: 1,
    WIN: 2,
  };

  static GameStates = {
    PLAY: 0,
    EDIT: 1,
    BUSY: 2,
    DONT_DO_ANYTHING: 3,
  };
}
