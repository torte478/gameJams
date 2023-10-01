import Enums from "./Enums.js";

export default class Config {

    static Debug = {
        Global: true,
        Log: true,
        ShowSceneLog: true,
        PlaySound: true,
        Random: true,
        IsFinalUndeground: false,
        Position: false,
        DebugX: 4800,
        DebugY: 1390
    };

    static StartLevel = 1;

    static WorldBorder = 9525;
    static WorldStartX = 400;
    static BackgroundColor = '#0d0d0d';
    static BossAppearanceTimeMs = 2000;
    static BossHandsDelayMs = 700;
    static BorderBreakDelayMs = 3000
    static LightColor = {
        R: 193, B: 252, G: 250
    };

    static Player = {
        StartX: 100,
        StartY: 1390,
        Speed: 700, // debug
        // Speed: 300,
        GravityFall: 1000,
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
        SecondOffsetX: -100,
        ReverseOffset: 300
    }
x
}