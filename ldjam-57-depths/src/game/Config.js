export default class Config {
  static Debug = {
    Global: true,
    Log: true,
    ShowSceneLog: true,
    PlaySound: true,
    Random: false,
  };

  static Start = {
    Mana: 10, //0
    PlayerX: 250,
    PlayerY: 400,
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
    MaxGarbageCountAtBag: 2,
    MaxMopDirt: 4,
    MaxBucketDirt: 8,
    FireballSpeed: 800,
    MaxMana: 10,
    FireballCost: 2,
    UtilizeBagCost: 1,
    WallToGarbageCount: 4,
  };

  static Light = {
    MaxLight: 20,
    MaxAlpha: 0.9,
    LitleFireballLight: 10,
    BigFireballLight: 20,
  };
}
