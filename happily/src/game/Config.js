import Enums from "./Enums.js";

export default class Config {

    static Debug = {
        Global: true,
        Text: true,
        Log: true
    };

    static Levels = [
        {
            buttons: [
                { x: 375, y: 739, doors: [ 0 ] }
            ],
            doors: [
                { x: 565, y: 670 }
            ],
            bottles: [
                // { x: 100, y: 725 },
                // { x: 425, y: 725 },
            ],
            flame: [
                // { x: 375, y: 775, angle: 270 },
                // { x: 725, y: 550, angle: 180 },
            ],
            targets: [
                // { x: 375, y: 713, type: Enums.TargetType.IRON },
                // { x: 550, y: 713, type: Enums.TargetType.KETTLE }
            ]
        }
    ]
}