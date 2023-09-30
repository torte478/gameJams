export default class Config {

    static Debug = {
        Global: true,
        Log: true,
        ShowSceneLog: true,
        PlaySound: true,
        Random: false
    };

    static Player = {
        StartX: 300,
        StartY: 700,
        Gravity: 600,
        Bounce: 0.2,
        GroundSpeed: 500,
        Jump: -590
    };

    static Camera = {
        OffsetX: -300,
        OffsetY: 200,
        Border: 1475
    }
}