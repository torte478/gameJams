export default class Config {

    static Debug = {
        Global: true,
        Log: true,
        ShowSceneLog: true,
        PlaySound: true,
        Random: false
    };

    static Border = 7425;
    static Start = 400;

    static Player = {
        StartX: 1620,
        StartY: 850,
        // Speed: 500,
        Speed: 300,
        GravityFall: 1200,
        GravityJump: 400,
        JumpForce: -600,
        JumpTimeMs: 100,
        FallAccelaration: 800
    };

    static Camera = {
        OffsetX: -300,
        OffsetY: 0
    }
}