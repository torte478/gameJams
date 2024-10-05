import Enums from "./Enums.js";

export default class Config {
  static Debug = {
    Global: true,
    Log: true,
    ShowSceneLog: true,
    PlaySound: true,
    Random: false,
    Skip: false,
  };

  static Init = {
    Difficulty: Enums.Difficulty.HARD,
    Side: Enums.Side.CROSS,
  };

  static Duration = {
    Layer: 1000,
  };

  static Scale = {
    Small: 0.25,
    Normal: 1,
    Big: 4,
  };
}
