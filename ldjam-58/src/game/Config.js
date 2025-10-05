export default class Config {
  static Debug = {
    Global: true,
    Log: true,
    ShowSceneLog: true,
    IgnoreSound: false,
    Random: false,
    Delays: false,
    StartAct: 4,
    WalkSpeed: 3,
    GameOverLimit: 0,
    GameOver: false,
  };

  static TakeOrderPosition = -1450;

  static Positions = {
    Start: 0, //-700, //0,
    Hole: -510,
    NpcSpawn: -1400,
  };

  static Orders = [
    [5], // 0
    [2, 1, 6], // 1
    [1], //, 1, 1], // 2
    [1], // 3
    [8031810176 - 1], // 4
  ];
}
