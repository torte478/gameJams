export default class Config {

    static Debug = {
        Global: true,
        Log: true,
        ShowSceneLog: true,
        PlaySound: true,
        Random: false
    };

    static Player = {
        StartX: 6500,
        StartY: 1000
    };

    static Physics = {
        ConnectionStep: 200,
        ConnectionMax: 400,
        ConnectionFriction: 150,

        Gravity: 600,
        PlayerSpeed: 400,
        PlayerJump: -700,
    }

    static TrashPosition = {
        x: -1000,
        y: -1000
    };
}