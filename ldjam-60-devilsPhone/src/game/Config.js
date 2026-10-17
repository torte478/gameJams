import Enums from "./Enums.js";
import LevelInfo from "./LevelInfo.js";

export default class Config {
  static Debug = {
    Global: true,
    Log: true,
    ShowSceneLog: true,
    PlaySound: true,
    Random: false,
    Level: false,
    Duration: false,
  };

  static Start = {
    State: Enums.GameState.MAIN_MENU,
    DebugLevel: 4,
  };

  static Duration = {
    LevelEnter: 2000,
  };

  static Phone = {
    MaxAnglePerFrame: 30,
    RollbackSpeed: 360,
    WalkCurveCirlceRadius: 25,
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
    // 4
    {
      goal: "111",
      timerSec: 10,
    },
  ];
}
