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
        StartX: 2700,
        StartY: 1200,
        Speed: 500,
        // Speed: 300,
        GravityFall: 1200,
        GravityJump: 200,
        JumpForce: -400,
        JumpTimeMs: 200,
        FallAccelaration: 600
    };

    static Camera = {
        OffsetY: 0,
        StartBoundY: 800,
        BoundRoofY: 150,
        BoundGroundY: 800,
        BoundUndergroundY: 1400,
        StartOffsetX: -300,
        SecondOffsetX: -100
    }
}