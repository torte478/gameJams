export default class Levels {
    static Config = [
        // 0
        {
            doors: [
                {
                    id: 1,
                    x: 75,
                    y: 1300,
                    horizontal: true
                },
                {
                    id: 2,
                    x: 125,
                    y: 1300,
                    horizontal: true
                }
            ],

            buttons: [
                {
                    id: 1,
                    x: 925,
                    y: 1250,
                    angle: 0,
                    doorsToOpen: [ 1, 2 ],
                    buttonsToPull: [ 2 ]
                },
                {
                    id: 2,
                    x: 275,
                    y: 1400,
                    angle: 90,
                    doorsToClose: [ 1, 2 ],
                    buttonsToPull: [ 1 ]
                }
            ],

            exits: [
                {
                    id: 1,
                    x: 925,
                    y: 1525
                }
            ],

            turrets: [
                {
                    id: 1,
                    x: 150,
                    y: 1050,
                    flip: false
                },
                {
                    id: 2,
                    x: 925,
                    y: 1400,
                    flip: true,
                    speed: 0.5
                }
            ],
        }
    ];
}