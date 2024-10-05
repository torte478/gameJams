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
    Layer: 0,
  };

  static Duration = {
    LayerChange: 1000,
  };

  static Scale = {
    Small: 0.25,
    Normal: 1,
    Big: 4,
  };
}
