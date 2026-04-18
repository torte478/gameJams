export default class Config {
  static Debug = {
    Global: true,
    Log: true,
    ShowSceneLog: true,
    PlaySound: true,
    Random: false,
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
    SpawnSignalPeriodMd: 1000,
  };

  static NewTowerCost = 1;
  static BossHP = 100;

  static EatSignalRadius = 5;
  static EdgeThickness = 1;
  static RemoveEdgeOffset = 10;
  static MaxSignalPerTower = 8;

  static TowerPositions = [
    { x: 300, y: 400 },
    { x: 700, y: 500 },
    { x: 550, y: 200 },
    { x: 400, y: 700 },
  ];
}
