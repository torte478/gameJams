export default class Config {
  static Debug = {
    Global: true,
    Log: true,
    ShowSceneLog: true,
    PlaySound: true,
    Random: false,
  };

  static Start = {
    Mana: 0,
    PlayerX: 605,
    PlayerY: 500,
  };

  static Tiles = {
    Walls: [1, 3],
  };

  static Player = {
    Speed: 400,
    SpotSpeed: 500,
    GarbageSpeed: 100,
    BagSpawnVelocity: 500,
    SpotCreatePeriodSec: 1,
    StepSpotCount: 3,
    StepSpotIntervalSec: 0.25,
  };

  static Tools = {
    MaxGarbageCountAtBag: 4,
    MaxMopDirt: 8,
    MaxBucketDirt: 20,
    FireballSpeed: 800,
    MaxMana: 10,
    FireballCost: 10,
    UtilizeBagCost: 5,
    UtilizeBucketCost: 4,
    WallToGarbageCount: 4,
  };

  static Light = {
    MaxLight: 20,
    MaxAlpha: 0.9,
    LitleFireballLight: 10,
    BigFireballLight: 20,
  };
}
