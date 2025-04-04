import ColorConfig from "./ColorConfig.js";
import Enums from "./Enums.js";

export default class Config {
  static Debug = {
    Global: false,
    Log: true,
    ShowSceneLog: true,
    PlaySound: true,
    Random: false,
    Skip: true,
  };

  static Init = {
    Difficulty: Enums.Difficulty.NORMAL,
    Side: Enums.Side.CROSS,
    Skip: 0,
    BonusCount: 0,
    PlayMusic: true,
  };

  static Duration = {
    Layer: 600,
    Between: 400,
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

  static Bonuses = {
    x: -180,
    y: 100,
    segments: [4, 5, 9],
    segmentSizeX: 60,
    segmentSizeY: 28,
    buttonSizeX: 100,
    buttonSizeY: 60,
  };

  static Boss = {
    MaxHP: 50,
  };

  // switch palette
  static Colors = [
    new ColorConfig(0x323a39, 0xe8f3f1, 0xc341ac, 0x000000), // 0
    new ColorConfig(0x003f30, 0x00e1c7, 0x9233a5, 0x00c8db), // 1
    new ColorConfig(0x002d63, 0x0098da, 0xe69c24, 0x8b5eb5), // 2
    new ColorConfig(0xbac4ff, 0x0043af, 0xc4a862, 0x8a55bb), // 3
    new ColorConfig(0xb1a8b9, 0x370079, 0xa91c06, 0x006fcf), // 4
  ];
}
