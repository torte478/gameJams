export default class Config {

    static Debug = {
        Global: true,
        Text: true,
        Log: true
    };

    static Levels = [
        {
            buttons: [
                {
                    x: 375,
                    y: 739,
                    doors: [ 0, 1 ]
                },
                {
                    x: 325,
                    y: 739,
                    doors: [ 2 ]
                }
            ],
            doors: [
                { x: 565, y: 670 },
                { x: 515, y: 670 },
                { x: 565, y: 620 }
            ]
        }
    ]
}