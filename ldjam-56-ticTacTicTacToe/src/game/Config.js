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
    Difficulty: Enums.Difficulty.DEBUG,
    Side: Enums.Side.CROSS,
  };

  static Duration = {
    Layer: 100,
  };

  static Scale = {
    Small: 0.25,
    Normal: 1,
    Big: 4,
  };
}
