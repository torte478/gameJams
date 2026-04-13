export default class Config {
  static Debug = {
    Global: false,
    Log: true,
    ShowSceneLog: true,
    IgnoreSound: false,
    Random: false,
    Delays: false,
    StartAct: 4,
    WalkSpeed: 1.5,
    GameOverLimit: 1000,
    GameOver: true,
  };

  static TakeOrderPosition = -1450;

  static Positions = {
    Start: 0, //-700, //0,
    Hole: -510,
    NpcSpawn: -1400,
  };

  static Orders = [
    // [0], //--
    [5], // 0
    [2, 1, 6], // 1
    [50, 3, 87], // 2
    [4586, 6998], // 3 car
    [8031810176 - 1], // 4
  ];
}
