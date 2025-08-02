import Enums from "./Enums.js";
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
    DisableHihats: false,
  };

  static StartState = Enums.GameStates.PLAY;

  static DurationMs = {
    LevelChange: 500,
  };

  static LevelOrder = [
    "protec_tutorial",
    // "attack_tutorial",
    // "turn_tutorial",
    // "trampoline_hell",
    // "shield_tutorial",
    // "walk_spikes",
    // "trampoline_tutorial",
    // "trampoline_hell",
    // "shield_tutorial",
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
      name: "protec_tutorial",
      startTilePos: { x: 1, y: 8 },
      finishTilePos: { x: 18, y: 8 },
      solution: [
        [0, 0, 0, 0, 0, 0, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 0, 1, 1, 1, 0, 1],
      ],
      goodBarrels: [
        // ...
        { tileX: 6, tileY: 8 },
        { tileX: 11, tileY: 8 },
        { tileX: 16, tileY: 8 },
      ],
      badBarrels: [
        // ...
        { tileX: 4, tileY: 8 },
        { tileX: 9, tileY: 8 },
        { tileX: 14, tileY: 8 },
      ],
      trampolins: [
        //...
        { tileX: 3, tileY: 8, bits: [2] },
        { tileX: 8, tileY: 8, bits: [2] },
        { tileX: 13, tileY: 8, bits: [2] },
      ],
    },
    {
      name: "attack_tutorial",
      startTilePos: { x: 1, y: 8 },
      finishTilePos: { x: 18, y: 8 },
      solution: [
        [0, 0, 1, 0, 0, 0, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 0, 1, 1, 1, 0, 1],
      ],
      goodBarrels: [
        { tileX: 4, tileY: 8 },
        { tileX: 7, tileY: 8 },
        { tileX: 10, tileY: 8 },
        { tileX: 13, tileY: 8 },
        { tileX: 16, tileY: 8 },
      ],
    },
    {
      name: "turn_tutorial",
      startTilePos: { x: 1, y: 8 },
      finishTilePos: { x: 18, y: 8 },
      solution: [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 0],
      ],
      trampolins: [
        { tileX: 8, tileY: 8, bits: [7] },
        { tileX: 4, tileY: 6, bits: [7] },
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
      startTilePos: { x: 1, y: 6 },
      finishTilePos: { x: 18, y: 6 },
      solution: [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0, 0, 1, 0],
        [1, 1, 0, 1, 1, 1, 0, 1],
      ],
      guns: [{ tileX: 17, tileY: 8, bits: [2, 6] }],
      trampolins: [{ tileX: 16, tileY: 8, bits: [7] }],
    },
    {
      name: "trampoline_hell",
      startTilePos: { x: 1, y: 8 },
      finishTilePos: { x: 18, y: 6 },
      solution: [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 1, 0, 1, 1, 0, 0],
      ],
      spikes: [
        { tileX: 13, tileY: 5, bits: [0, 1, 4, 5] },
        { tileX: 14, tileY: 5, bits: [0, 1, 4, 5] },
      ],
      trampolins: [
        { tileX: 5, tileY: 8, bits: [3, 7] },
        { tileX: 9, tileY: 6, bits: [3, 7] },
        { tileX: 11, tileY: 4, bits: [3, 7] },
      ],
    },
    {
      name: "trampoline_tutorial",
      startTilePos: { x: 1, y: 8 },
      finishTilePos: { x: 18, y: 8 },
      solution: [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 1, 0, 1, 1, 1, 0],
      ],
      trampolins: [
        { tileX: 5, tileY: 8, bits: [3] },
        { tileX: 10, tileY: 8, bits: [3] },
        { tileX: 14, tileY: 8, bits: [3] },
      ],
    },
  ];
}
