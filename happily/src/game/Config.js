import Enums from "./Enums.js";

export default class Config {

    static Debug = {
        Global: true,
        Text: true,
        Log: true,
        Music: true,
        LevelIndex: true
    };

    static LevelIndex = 1;

    static Levels = [
        {
            tiles: 'level0',
            playerX: 330,//125,
            playerY: 150,//700,
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
                //{ x: 1560, y: 487, type: Enums.TargetType.IRON },
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
                //{ x: 375, y: 739, doors: [ 0 ] }
            ],
            doors: [
                //{ x: 565, y: 670 }
            ],
            bottles: [
                // { x: 100, y: 725 },
                // { x: 425, y: 725 },
            ],
            flame: [
                //{ x: 375, y: 775, angle: 270 },
                // { x: 725, y: 550, angle: 180 },
            ],
            targets: [
                { x: 165, y: 962, type: Enums.TargetType.IRON },
                { x: 820, y: 1062, type: Enums.TargetType.KETTLE },
                { x: 1430, y: 1412, type: Enums.TargetType.SINK },
                { x: 927, y: 437, type: Enums.TargetType.IRON },
                { x: 927, y: 187, type: Enums.TargetType.KETTLE },
            ]
        },
    ]
}