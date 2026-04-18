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

  static Events = {
    EDGE_ADDED: "EDGE_ADDED",
    EDGE_REMOVED: "EDGE_REMOVED",
    SCORE_INCREMENT: "SCORE_INCREMENT",
    NEW_TOWER_BUTTON_CLICK: "NEW_TOWER_BUTTON_CLICK",
  };
}
