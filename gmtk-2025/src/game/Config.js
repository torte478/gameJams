import LevelConfig from "./LevelConfig.js";

export default class Config {
  static Debug = {
    Global: true,
    Log: true,
    ShowSceneLog: true,
    PlaySound: true,
    Random: false,
    StartFromSolution: true,
    PauseOnRightClick: true,
    DisableHihats: true,
  };

  /** @type {LevelConfig[]} */
  static Levels = [
    {
      name: "walk_spikes",
      startTilePos: { x: 1, y: 8 },
      solution: [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 1, 1, 0, 1, 0, 0],
      ],
      items: {
        spikes: [
          { tileX: 6, tileY: 9, bits: [6, 7] },
          { tileX: 13, tileY: 9, bits: [3, 4] },
        ],
      },
    },
  ];
}
