import Enums from "./Enums.js";
import LevelConfig from "./LevelConfig.js";

export default class Config {
  static Debug = {
    Global: true,
    Log: true,
    ShowSceneLog: true,
    PlaySound: false,
    Random: true,
    StartFromSolution: true,
    PauseOnRightClick: true,
    DisableHihats: false,
    DetailLog: true,
  };

  static StartState = Enums.GameStates.PLAY;
  static StartHintCount = 0;

  static DurationMs = {
    LevelChange: 500,
    DragonHead: 1000,
    MinDragonTailPeriod: 5000,
    MaxDragonTailPeriod: 10000,
    DragonTailShowcase: 1000,
  };

  static LevelOrder = [
    // "test_level",
    // "walk_tutorial",
    // "walk_spikes",
    "trampoline_tutorial",
    "trampoline_hell",
    // "shield_tutorial",
    // "TODO_transmit",
    // "turn_tutorial",
    // "attack_tutorial",
    // el problemo
    // "cool_bit",
    // "TODO_transmit",
    // "protec_tutorial",
    // "rock_you",
    // "TODO_transmit",
    // "cool_16",
  ];

  /** @type {LevelConfig[]} */
  static Levels = [
    {
      name: "test_level",
      startTilePos: { x: 1, y: 6 },
      finishTilePos: { x: 18, y: 6 },
      solution: [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 1],
      ],
      length: 16,
      tempPlatforms: [
        // ...
        { tileX: 3, tileY: 7 },
        { tileX: 4, tileY: 7 },
        { tileX: 5, tileY: 7 },
      ],
    },
    {
      name: "walk_tutorial",
      csvName: "plain",
      availableCommands: [Enums.SampleCommands.WALK],
      ignoreDragonTail: true,
      startTilePos: { x: 1, y: 8 },
      finishTilePos: { x: 18, y: 8 },
      solution: [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 1],
      ],
    },
    {
      name: "TODO_transmit",
      csvName: "transmit",
      startTilePos: { x: 1, y: 6 },
      finishTilePos: { x: 18, y: 8 },
      solution: [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 1],
      ],
    },
    {
      name: "cool_16",
      startTilePos: { x: 1, y: 8 },
      finishTilePos: { x: 18, y: 8 },
      length: 16,
      solution: [
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
        [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0],
        [1, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
      ],
      spikes: [
        // TODO : mooooooooooooooooooooooooooooore spikes!!!!!!!!!!!!!!!!!!!
        { tileX: 5, tileY: 9, bits: [4, 5, 6, 7] },
      ],
      trampolins: [
        //...
        { tileX: 6, tileY: 8, bits: [15] },
        { tileX: 5, tileY: 6, bits: [0] },
        { tileX: 11, tileY: 6, bits: [7] },
        { tileX: 12, tileY: 4, bits: [8] },
      ],
      tempPlatforms: [
        // ...
        { tileX: 9, tileY: 5 },
      ],
      goodBarrels: [
        // ...
        { tileX: 10, tileY: 6 },
        { tileX: 14, tileY: 7 },
        { tileX: 14, tileY: 8 },
      ],
      badBarrels: [
        // ...
        { tileX: 7, tileY: 3 },
        { tileX: 14, tileY: 5 },
      ],
      guns: [
        // ...
        { tileX: 16, tileY: 4, bits: [2, 6] },
        { tileX: 16, tileY: 3, bits: [10] },
        { tileX: 8, tileY: 6, bits: [12] },
        { tileX: 16, tileY: 7, bits: [14] },
      ],
    },
    {
      name: "rock_you",
      startTilePos: { x: 1, y: 8 },
      finishTilePos: { x: 18, y: 6 },
      length: 16,
      solution: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
        [1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 1, 0, 0],
      ],
      trampolins: [
        //...
        { tileX: 3, tileY: 8, bits: [3, 15] },
        { tileX: 15, tileY: 6, bits: [3, 15] },
      ],
      guns: [
        // ...
        { tileX: 16, tileY: 6, bits: [2, 6, 10, 14] },
      ],
      spikes: [
        // ...
        {
          tileX: 5,
          tileY: 7,
          bits: [0, 1, 2, 3, 8, 9, 10, 11, 12, 13, 14, 15],
        },
        {
          tileX: 6,
          tileY: 7,
          bits: [0, 1, 2, 3, 4, 9, 10, 11, 12, 13, 14, 15],
        },
        {
          tileX: 7,
          tileY: 7,
          bits: [0, 1, 2, 3, 4, 5, 6, 11, 12, 13, 14, 15],
        },
        {
          tileX: 8,
          tileY: 7,
          bits: [0, 1, 2, 3, 4, 5, 6, 7, 12, 13, 14, 15],
        },
        {
          tileX: 9,
          tileY: 7,
          bits: [0, 1, 2, 3, 4, 5, 6, 7, 8, 13, 14, 15],
        },
        {
          tileX: 10,
          tileY: 7,
          bits: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        },
        {
          tileX: 11,
          tileY: 7,
          bits: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        },
        {
          tileX: 12,
          tileY: 7,
          bits: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        },
        {
          tileX: 13,
          tileY: 7,
          bits: [0, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
        },
      ],
    },
    {
      name: "cool_bit",
      startTilePos: { x: 1, y: 6 },
      finishTilePos: { x: 18, y: 6 },
      solution: [
        [1, 0, 1, 0, 1, 0, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 0, 0, 1, 0, 1],
        [1, 1, 0, 1, 1, 0, 1, 0],
      ],
      guns: [
        // ...
        { tileX: 7, tileY: 7, bits: [1, 3, 5, 7] },
        { tileX: 17, tileY: 8, bits: [2, 5, 7] },
        { tileX: 15, tileY: 5, bits: [2, 5, 7] },
      ],
      goodBarrels: [
        // ...
        { tileX: 3, tileY: 6 },
        { tileX: 9, tileY: 4 },
        { tileX: 11, tileY: 8 },
        { tileX: 13, tileY: 8 },
        { tileX: 15, tileY: 8 },
      ],
      trampolins: [
        //...
        { tileX: 6, tileY: 8, bits: [2] },
        { tileX: 8, tileY: 6, bits: [2] },
        { tileX: 10, tileY: 8, bits: [2] },
        { tileX: 12, tileY: 8, bits: [2] },
        { tileX: 14, tileY: 8, bits: [2] },
        { tileX: 16, tileY: 8, bits: [2] },
      ],
      spikes: [
        { tileX: 11, tileY: 7, bits: [0, 6] },
        { tileX: 13, tileY: 7, bits: [2, 6] },
        { tileX: 15, tileY: 7, bits: [4, 6] },
      ],
    },
    {
      name: "protec_tutorial",
      csvName: "plain",
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
      csvName: "plain",
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
        { tileX: 7, tileY: 7 },
        { tileX: 7, tileY: 8 },
        { tileX: 10, tileY: 7 },
        { tileX: 10, tileY: 8 },
        { tileX: 13, tileY: 7 },
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
      csvName: "plain",
      availableCommands: [Enums.SampleCommands.WALK],
      ignoreDragonTail: true,
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
      // availableCommands: [Enums.SampleCommands.WALK],
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
