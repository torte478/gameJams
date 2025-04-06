export default class Config {
  static Debug = {
    Global: true,
    Log: true,
    ShowSceneLog: true,
    PlaySound: true,
    Random: false,
  };

  static Start = {
    Mana: 1000,

    // start
    // PlayerX: 605,
    // PlayerY: 500,

    // dungeon
    PlayerX: 1000,
    PlayerY: 1800,

    //temp
    // PlayerX: 1800,
    // PlayerY: 4000,
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
    MaxGarbageCountAtBag: 3,
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
    MaxAlpha: 0.95,
    LitleFireballLight: 10,
    BigFireballLight: 20,
  };

  static Sound = {
    MainMinVolume: 0.1,
    MainMaxVolume: 0.5,
    MainMinDetune: -200,
    MainMaxDetune: 0,
    AmbientMinVolume: 0,
    AmbientMaxVolume: 0.75,
    StartHeight: 2100,
    StopHeight: 5300,
  };
}
