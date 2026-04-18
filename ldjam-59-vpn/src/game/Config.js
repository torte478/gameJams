export default class Config {
  static Debug = {
    Global: true,
    Log: true,
    ShowSceneLog: true,
    PlaySound: true,
    Random: false,
    CutsceneZoom: false,
  };

  static Start = {
    TowersCount: 2,
    EnemiesCount: 0,
    Score: 0,
    Edges: [{ from: 0, to: 1 }],
  };

  static Speed = {
    Signal: 300,
    RknMovement: 300,
  };

  static Time = {
    SpawnSignalPeriodMs: 1000,
    // Endgame sequence
    P0_Zoom: 1000,
    P1_WaitBeforeStartRestartAnimaion: 1000,
    P2_1_BossAttackAndFade: 1000,
    P2_2_AllRed: 2000,
    P3_FadeOut: 1000,
  };

  static NewTowerCost = 1;
  static BossHP = 100;

  static EatSignalRadius = 5;
  static EdgeThickness = 1;
  static RemoveEdgeOffset = 10;
  static MaxSignalPerTower = 8;
  static CutsceneCameraZoom = 0.75;
  static BossJiggleOffset = 25;

  static TowerPositions = [
    { x: 300, y: 400 },
    { x: 700, y: 500 },
    { x: 550, y: 200 },
    { x: 400, y: 700 },
  ];
}
