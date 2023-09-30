export default class Config {

    static Debug = {
        Global: true,
        Log: false,
        ShowSceneLog: true,
        PlaySound: true,
        Random: false,
        IsFinalUndeground: false
    };

    static StartLevel = 0;

    static WorldBorder = 9525;
    static WorldStartX = 400;
    static BackgroundColor = '#0d0d0d';

    static Player = {
        StartX: 2800,
        StartY: 1390,
        // Speed: 500,
        Speed: 300,
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