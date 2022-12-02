export default class Config {

    static Debug = {
        Global: true,
        Log: true,
        ShowSceneLog: true,
        PlaySound: true,
        Random: false
    };

    static Start = {
        PlayerX: 4000,
        PlayerY: 1800,
        Containers: [
            { x: 2800, y: 1800 }
        ],
        Squares: [
            { x: 4200, y: 1850 }
        ]
    };

    static Physics = {
        ConnectionStep: 200,
        ConnectionMax: 400,
        ConnectionFriction: 150,

        Gravity: 600,
        PlayerSpeed: 400,
        PlayerJump: -700,

        SquareSpeed: 100
    }

    static TrashPosition = {
        x: -1000,
        y: -1000
    };
}