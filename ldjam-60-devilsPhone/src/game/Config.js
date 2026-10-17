import Enums from "./Enums.js";

export default class Config {
  static Debug = {
    Global: true,
    Log: true,
    ShowSceneLog: true,
    PlaySound: true,
    Random: false,
  };

  static Start = {
    State: Enums.GameState.MAIN_MENU,
  };

  static Phone = {
    MaxAnglePerFrame: 30,
    RollbackSpeed: 360,
  };
}
