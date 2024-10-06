import ColorConfig from "./ColorConfig.js";
import Enums from "./Enums.js";

export default class Config {
  static Debug = {
    Global: true,
    Log: true,
    ShowSceneLog: true,
    PlaySound: true,
    Random: true,
    Skip: true,
  };

  static Init = {
    Difficulty: Enums.Difficulty.EASY,
    Side: Enums.Side.CROSS,
    Skip: 1,
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

  // switch palette
  static Colors = [
    new ColorConfig(0x1b3649, 0xbfdaf2, 0xaa6800), // 0
    new ColorConfig(0x003826, 0x8ecfb6, 0x005ccf), // 1
    new ColorConfig(0xaf74af, 0x410b43, 0x00c9c4), // 2
  ];
}
