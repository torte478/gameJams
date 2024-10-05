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
    Difficulty: Enums.Difficulty.NORMAL,
    Side: Enums.Side.CROSS,
    Skip: 2,
  };

  static Duration = {
    Layer: 1000,
    Between: 250,
  };

  static Scale = {
    Small: 0.25,
    Normal: 1,
    Big: 4,
  };
}
