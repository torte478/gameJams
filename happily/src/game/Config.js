export default class Config {

    static Debug = {
        Global: true,
        Text: true,
        Log: true
    };

    static Levels = [
        {
            buttons: [
                // { x: 375, y: 739, doors: [ 0, 1 ] }
            ],
            doors: [
                // { x: 565, y: 670 }
            ],
            bottles: [
                { x: 200, y: 725 },
                // { x: 425, y: 725 },
            ],
            flame: [
                { x: 375, y: 775, angle: 270 },
                { x: 725, y: 550, angle: 180 },
            ]
        }
    ]
}