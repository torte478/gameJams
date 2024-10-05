import Enums from "./Enums.js";

export default class Config {
  static Debug = {
    Global: true,
    Log: true,
    ShowSceneLog: true,
    PlaySound: true,
    Random: false,
  };

  static Init = {
    Difficulty: Enums.Difficulty.HARD,
    Side: Enums.Side.NOUGHT,
  };
}
