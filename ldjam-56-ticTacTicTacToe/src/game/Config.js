import ColorConfig from "./ColorConfig.js";
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

  static MapSegment = {
    x: 720,
    y: 0,
    width: 50,
    height: 125,
  };

  // switch palette
  static Colors = [
    new ColorConfig(0x323a39, 0xe8f3f1, 0xc341ac), // 0
    new ColorConfig(0x003f30, 0x00e1c7, 0x9233a5), // 1
    new ColorConfig(0x002d63, 0x0098da, 0xe69c24), // 2
    new ColorConfig(0xbac4ff, 0x0043af, 0xc4a862), // 3
    new ColorConfig(0xb1a8b9, 0x370079, 0xa91c06), // 4
  ];
}
