import Enums from "./Enums.js";

export default class Config {

    static Debug = {
        Global: true,
        Text: true,
        Log: true,
        Music: true,
        LevelIndex: true
    };

    static LevelIndex = 3;

    static Levels = [
        {
            tiles: 'level0',
            playerX: 125, //330,//125,
            playerY: 700, //150,//700,
            sheX: 1026,
            sheY: 487,
            buttons: [
            ],
            doors: [
            ],
            bottles: [
            ],
            flame: [
            ],
            targets: [
                { x: 1560, y: 487, type: Enums.TargetType.IRON },
                { x: 486, y: 162, type: Enums.TargetType.KETTLE }
            ]
        },
        {
            tiles: 'level1',
            playerX: 125,
            playerY: 1390,
            sheX: 479,
            sheY: 1187,
            buttons: [
            ],
            doors: [
            ],
            bottles: [
            ],
            flame: [
            ],
            targets: [
                { x: 165, y: 962, type: Enums.TargetType.IRON },
                { x: 820, y: 1062, type: Enums.TargetType.KETTLE },
                { x: 1430, y: 1412, type: Enums.TargetType.SINK },
                { x: 927, y: 437, type: Enums.TargetType.IRON },
                { x: 927, y: 187, type: Enums.TargetType.KETTLE },
            ]
        },
        {
            tiles: 'level2',
            playerX: 125,
            playerY: 700,
            sheX: 110,
            sheY: 212,
            buttons: [
            ],
            doors: [
            ],
            bottles: [
            ],
            flame: [
                { x: 300, y: 775, angle: 270 },
                { x: 600, y: 775, angle: 270 },
                { x: 950, y: 350, angle: 0 },
            ],
            targets: [
                { x: 380, y: 212, type: Enums.TargetType.IRON },
            ]
        },
        {
            tiles: 'level3',
            playerX: 350,
            playerY: 460,
            sheX: 80,
            sheY: 262,
            buttons: [
            ],
            doors: [
            ],
            bottles: [
                { x: 440, y: 287 },
                { x: 970, y: 490 },
            ],
            flame: [
                { x: 250, y: 550, angle: 270 },
                { x: 675, y: 450, angle: 270 },
                { x: 725, y: 450, angle: 270 },
                { x: 875, y: 550, angle: 270 },
                { x: 625, y: 775, angle: 270 },
            ],
            targets: [
                { x: 430, y: 137, type: Enums.TargetType.IRON },
                { x: 250, y: 712, type: Enums.TargetType.KETTLE },
            ]
        },
        {
            tiles: 'level4',
            playerX: 100, //100,
            playerY: 100, //100,
            sheX: 478,
            sheY: 162,
            buttons: [
                //{ x: 375, y: 739, doors: [ 0 ] }
            ],
            doors: [
                //{ x: 565, y: 670 }
            ],
            bottles: [
                { x: 850, y: 1387 },
                { x: 825, y: 875 },
                { x: 975, y: 165 },
            ],
            flame: [
                { x: 175, y: 625, angle: 270 },
                { x: 225, y: 625, angle: 270 },
                { x: 75, y: 1000, angle: 270 },
                { x: 125, y: 1000, angle: 270 },
                { x: 150, y: 1325, angle: 270 },
                { x: 475, y: 1400, angle: 180 },
                { x: 675, y: 1400, angle: 180 },
                { x: 575, y: 900, angle: 270 },
                { x: 475, y: 850, angle: 180 },
                { x: 475, y: 350, angle: 180 },
                { x: 825, y: 425, angle: 270 },
                { x: 975, y: 425, angle: 270 },
                { x: 775, y: 175, angle: 180 },
            ],
            targets: [
                { x: 660, y: 162, type: Enums.TargetType.SINK },
                //{ x: 250, y: 712, type: Enums.TargetType.KETTLE },
                // { x: 1430, y: 1412, type: Enums.TargetType.SINK },
                // { x: 927, y: 437, type: Enums.TargetType.IRON },
                // { x: 927, y: 187, type: Enums.TargetType.KETTLE },
            ]
        },
    ]
}