import Enums from "./Enums.js";
import LevelInfo from "./LevelInfo.js";

export default class Config {
  static Debug = {
    Global: true,
    Log: true,
    ShowSceneLog: true,
    PlaySound: true,
    Random: false,
    Level: true,
  };

  static Start = {
    State: Enums.GameState.MAIN_MENU,
    DebugLevel: 1,
  };

  static Phone = {
    MaxAnglePerFrame: 30,
    RollbackSpeed: 360,
  };

  /** @type {LevelInfo[]} */
  static Levels = [
    // 0
    {
      // TODO: most hard level
      goal: "99999999999999999",
    },
    // 1
    {
      goal: "4",
    },
    // 2
    {
      goal: "52",
    },
    // 3
    {
      goal: "123",
    },
  ];
}
