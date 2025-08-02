import Enums from "./Enums.js";
import LevelConfig from "./LevelConfig.js";

export default class Config {
  static Debug = {
    Global: true,
    Log: true,
    ShowSceneLog: true,
    PlaySound: false,
    Random: false,
    StartFromSolution: true,
    PauseOnRightClick: true,
    DisableHihats: false,
  };

  static StartState = Enums.GameStates.PLAY;

  static DurationMs = {
    LevelChange: 500,
  };

  static LevelOrder = [
    "walk_spikes",
    "walk_spikes",
    "walk_spikes",
    //"test_level",
    "shield_tutorial",
    "test_level",
    "walk_spikes",
    "shield_tutorial",
  ];

  /** @type {LevelConfig[]} */
  static Levels = [
    {
      name: "test_level",
      startTilePos: { x: 17, y: 8 },
      finishTilePos: { x: 18, y: 8 },
      solution: [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 1],
      ],
    },
    {
      name: "walk_spikes",
      startTilePos: { x: 1, y: 8 },
      finishTilePos: { x: 18, y: 8 },
      solution: [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 0, 0, 0, 0],
      ],
      spikes: [
        { tileX: 6, tileY: 9, bits: [4, 5, 6, 7] },
        { tileX: 10, tileY: 9, bits: [4, 5, 6, 7] },
        { tileX: 11, tileY: 9, bits: [4, 5, 6, 7] },
        { tileX: 14, tileY: 9, bits: [4, 5, 6, 7] },
        { tileX: 15, tileY: 9, bits: [4, 5, 6, 7] },
        { tileX: 16, tileY: 9, bits: [4, 5, 6, 7] },
      ],
    },
    {
      name: "shield_tutorial",
      startTilePos: { x: 1, y: 8 },
      finishTilePos: { x: 18, y: 6 },
      solution: [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0, 0, 1, 0],
        [1, 1, 0, 1, 1, 1, 0, 1],
      ],
      guns: [{ tileX: 17, tileY: 8, bits: [2, 6] }],
      trampolins: [
        { tileX: 3, tileY: 8, bits: [7] },
        { tileX: 16, tileY: 8, bits: [7] },
      ],
    },
  ];
}
