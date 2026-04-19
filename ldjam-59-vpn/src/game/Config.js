import Enums from "./Enums.js";

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
    QuickDelays: false,
  };

  static Start = {
    PhaseId: Enums.Phase.P5_THE_GAME,
    TowersCount: 2,
    RKN: 0,
    Score: 100,
    Edges: [
      // { from: 0, to: 1 },
      // { from: 0, to: 2 },
      // { from: 0, to: 3 },
    ],
  };

  static TowerInfo = [
    { x: 300, y: 400, cost: 0 }, // A
    { x: 700, y: 400, cost: 0 }, // B
    { x: 550, y: 200, cost: 5 }, // C
    { x: 250, y: 700, cost: 10 }, // D
    { x: 850, y: 250, cost: 16 }, // E
    { x: 60, y: 250, cost: 25 }, // F
  ];

  static Color = {
    Dark: 0x140b23,
    NotSoDark: 0x1f304c,
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
    Signal: 100,
    RknMovement: 100,
    TapeFall: 800,
    Tentacle: 100,
  };

  static Time = {
    SpawnSignal: [
      2500, // 0
      2000, // 1
      2000, // 2
      1750, // 3
      1500, // 4
      1000, // 5
    ],
    SignalRateRecalculationPeriod: 15000,
    // Endgame sequence
    P0_Zoom: 1000,
    P1_WaitBeforeStartRestartAnimaion: 1000,
    P2_1_BossAttackAndFade: 1000,
    P2_2_AllRed: 2000,
    P3_FadeOut: 1000,
  };

  static NewTowerCost = 1;
  static BossHP = 100; //deprecated

  static BossCost = 0; //1000;
  static BossFirePeriod = 250;

  static RknStartScale = 0.5;
  static RknScaleChange = 0.1;
  static RknMaxScale = 1;

  static EdgeThickness = 2;
  static ManualLineThickness = 4;
  static SelectedEdgeThickness = 12;

  static FontFamily = "Arial";
  static EatSignalRadius = 5;
  static RemoveEdgeOffset = 10;
  static MaxSignalPerTower = 9;
  static CutsceneCameraZoom = 0.75;
  static BossJiggleOffset = 25;
}
