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
    Difficulty: Enums.Difficulty.EASYr,
    Side: Enums.Side.NOUGHT,
  };
}
