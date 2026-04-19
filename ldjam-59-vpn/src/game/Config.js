export default class Config {
  static Debug = {
    Global: true,
    Log: true,
    ShowSceneLog: true,
    PlaySound: true,
    Random: false,
    CutsceneZoom: false,
    AutoMode: true,
    SignalQueueView: false,
  };

  static Start = {
    TowersCount: 2,
    RKN: 0,
    Score: 0,
    Edges: [
      { from: 0, to: 1 },
      // { from: 0, to: 2 },
      // { from: 0, to: 3 },
    ],
  };

  static Color = {
    Dark: 0x140b23,
    Light: 0xf7ebff,
    Red: 0xd4745c,
    Green: 0x00c8a0,
    TowerLight: {
      Green: 0x00ff00,
      Yellow: 0xffff00,
      Red: 0xff0000,
    },
  };

  static Speed = {
    Signal: 300,
    RknMovement: 300,
  };

  static Time = {
    SpawnSignalPeriodMs: 3000,
    SignalRateRecalculationPeriod: 5000,
    // Endgame sequence
    P0_Zoom: 1000,
    P1_WaitBeforeStartRestartAnimaion: 1000,
    P2_1_BossAttackAndFade: 1000,
    P2_2_AllRed: 2000,
    P3_FadeOut: 1000,
  };

  static NewTowerCost = 1;
  static BossHP = 100;

  static FontFamily = "Arial";
  static EatSignalRadius = 5;
  static EdgeThickness = 2;
  static RemoveEdgeOffset = 10;
  static MaxSignalPerTower = 9;
  static CutsceneCameraZoom = 0.75;
  static BossJiggleOffset = 25;

  static TowerPositions = [
    { x: 300, y: 400 },
    { x: 700, y: 500 },
    { x: 550, y: 200 },
    { x: 400, y: 700 },
  ];
}
