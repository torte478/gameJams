export default class Config {
  static Debug = {
    Global: true,
    Log: true,
    ShowSceneLog: true,
    IgnoreSound: false,
    Random: false,
    Delays: true,
    Order: 1,
    StartAct: 1,
    WalkSpeed: 3,
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
    // 3
  ];
}
