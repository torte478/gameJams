import Enums from "./Enums.js";

export default class Config {

    static Debug = {
        Global: false,
        Text: true,
        Log: true,
        Music: false,
        LevelIndex: false
    };

    static LevelIndex = 6;

    static FinalLevelIndex = 9;

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
            tiles: 'level8',
            playerX: 100, //330,//125,
            playerY: 400, //150,//700,
            sheX: 2370,
            sheY: 462,
            medley: true,
            buttons: [
            ],
            doors: [
            ],
            bottles: [
            ],
            flame: [
            ],
            targets: [
                { x: 225, y: 462, type: Enums.TargetType.IRON },
                { x: 425, y: 462, type: Enums.TargetType.KETTLE },
                { x: 625, y: 462, type: Enums.TargetType.SINK },
                { x: 825, y: 462, type: Enums.TargetType.IRON },
                { x: 1025, y: 462, type: Enums.TargetType.KETTLE },
                { x: 1225, y: 462, type: Enums.TargetType.SINK },
                { x: 1425, y: 462, type: Enums.TargetType.IRON },
                { x: 1625, y: 462, type: Enums.TargetType.KETTLE },
                { x: 1825, y: 462, type: Enums.TargetType.SINK },
                { x: 2025, y: 462, type: Enums.TargetType.IRON },
                { x: 2225, y: 462, type: Enums.TargetType.KETTLE },
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
            tiles: 'level6',
            playerX: 100, 
            playerY: 300, 
            sheX: 100,
            sheY: 687,
            buttons: [
                { x: 160, y: 450, doors: [ 0, 1, 2 ] },
                { x: 710, y: 700, doors: [ 3, 4, 5, 6 ] },
            ],
            doors: [
                { x: 400, y: 350 },
                { x: 400, y: 400 },
                { x: 400, y: 450 },
                { x: 500, y: 550 },
                { x: 500, y: 600 },
                { x: 500, y: 650 },
                { x: 500, y: 700 }
            ],
            bottles: [
                { x: 335, y: 450 },
                { x: 1201, y: 694 },
            ],
            flame: [
            ],
            targets: [
                { x: 1196, y: 237, type: Enums.TargetType.KETTLE },
                { x: 280, y: 687, type: Enums.TargetType.IRON }
            ]
        },
        {
            tiles: 'level9',
            playerX: 200, //330,//125,
            playerY: 400, //150,//700,
            sheX: 100,
            sheY: 462,
            medley: true,
            buttons: [
            ],
            doors: [
            ],
            bottles: [
                { x: 350, y: 475 },
                { x: 550, y: 475 },
                { x: 750, y: 475 },
                { x: 950, y: 475 },
                { x: 1000, y: 475 },
                { x: 1200, y: 475 },
                { x: 1300, y: 475 },
                { x: 1500, y: 475 },
                { x: 1600, y: 475 },
                { x: 1700, y: 475 },
                { x: 1800, y: 475 },
            ],
            flame: [
                { x: 450, y: 525, angle: 270 },
                { x: 650, y: 525, angle: 270 },
                { x: 850, y: 525, angle: 270 },
                { x: 1100, y: 525, angle: 270 },
                { x: 1400, y: 525, angle: 270 },
                { x: 1900, y: 525, angle: 270 },
            ],
            targets: [
                { x: 2225, y: 462, type: Enums.TargetType.KETTLE },
            ]
        },
        {
            tiles: 'level7',
            playerX: 100, 
            playerY: 100, 
            sheX: 550,
            sheY: 462,
            buttons: [
                { x: 745, y: 700, doors: [ 0, 1, 2, 3 ] }
            ],
            doors: [
                { x: 425, y: 225 },
                { x: 475, y: 225 },
                { x: 525, y: 225 },
                { x: 575, y: 225 },
            ],
            bottles: [
                { x: 1201, y: 694 },
            ],
            flame: [
                { x: 825, y: 375, angle: 270 },
            ],
            targets: [
                { x: 222, y: 462, type: Enums.TargetType.KETTLE },
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
        {
            tiles: 'level5',
            playerX: 100, //100,
            playerY: 100, //100,
            sheX: 2475,
            sheY: 1037,
            buttons: [
                //{ x: 375, y: 739, doors: [ 0 ] }
            ],
            doors: [
                //{ x: 565, y: 670 }
            ],
            bottles: [
                // { x: 850, y: 1387 },
                // { x: 825, y: 875 },
                // { x: 975, y: 165 },
            ],
            flame: [
                //{ x: 2525, y: 1525, angle: 270 },
            ],
            targets: [
                { x: 750, y: 212, type: Enums.TargetType.KETTLE },
                // { x: 250, y: 712, type: Enums.TargetType.KETTLE },
                // { x: 1430, y: 1412, type: Enums.TargetType.SINK },
                // { x: 927, y: 437, type: Enums.TargetType.IRON },
                // { x: 927, y: 187, type: Enums.TargetType.KETTLE },
            ]
        },
    ]
}