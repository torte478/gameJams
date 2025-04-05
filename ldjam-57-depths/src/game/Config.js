export default class Config {
  static Debug = {
    Global: true,
    Log: true,
    ShowSceneLog: true,
    PlaySound: true,
    Random: false,
  };

  static Start = {
    Mana: 100, //0
    PlayerX: 250,
    PlayerY: 400,
  };

  static Player = {
    Speed: 400,
    BagSpawnVelocity: 500,
  };

  static Tools = {
    MaxGarbageCountAtBag: 1,
    MaxMopDirt: 1,
    MaxBucketDirt: 1,
    FireballSpeed: 400,
    MaxMana: 10,
    FireballCost: 2,
    UtilizeBagCost: 1,
    WallToGarbageCount: 4,
  };
}
