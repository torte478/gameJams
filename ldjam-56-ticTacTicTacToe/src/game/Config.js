import Enums from "./Enums.js";

export default class Config {
  static Debug = {
    Global: true,
    Log: true,
    ShowSceneLog: true,
    PlaySound: true,
    Random: true,
    Skip: false,
  };

  static Init = {
    Difficulty: Enums.Difficulty.HARD,
    Side: Enums.Side.CROSS,
    Skip: 2,
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
