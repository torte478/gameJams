export default class Config {

    static Debug = {
        Global: true,
        Log: true,
        ShowSceneLog: true,
        PlaySound: true,
        Random: false
    };

    static Player = {
        StartX: 900,
        StartY: 600,
        Gravity: 600,
        GroundSpeed: 300, // 500,
        Jump: -590
    };

    static Camera = {
        OffsetX: -300,
        OffsetY: 200,
        Border: 3000
    }
}