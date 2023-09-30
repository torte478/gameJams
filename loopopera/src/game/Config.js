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
        StartX: 2255,
        StartY: 1000,
        // Speed: 500,
        Speed: 300,
        GravityFall: 1200,
        GravityJump: 200,
        JumpForce: -400,
        JumpTimeMs: 200,
        FallAccelaration: 600
    };

    static Camera = {
        OffsetX: -300,
        OffsetY: 0,
        BoundRoofY: 150,
        BoundGroundY: 800,
        StartBoundY: 800
    }
}