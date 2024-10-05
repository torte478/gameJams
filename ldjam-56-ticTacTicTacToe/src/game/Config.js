import Enums from "./Enums.js";

export default class Config {
  static Debug = {
    Global: true,
    Log: true,
    ShowSceneLog: true,
    PlaySound: true,
    Random: true,
  };

  static Init = {
    Difficulty: Enums.Difficulty.DEBUG,
    Side: Enums.Side.CROSS,
  };
}
