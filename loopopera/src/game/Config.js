import Enums from "./Enums.js";

export default class Config {

    static Debug = {
        Global: true,
        Log: true,
        ShowSceneLog: true,
        PlaySound: true,
        Random: false,
        IsFinalUndeground: true,
        Position: false,
        DebugX: 4800,
        DebugY: 1390
    };

    static StartLevel = 5;

    static WorldBorder = 9525;
    static WorldStartX = 400;
    static BackgroundColor = '#0d0d0d';
    static BossAppearanceTimeMs = 2000; //7000;

    static Player = {
        StartX: 100,
        StartY: 1390,
        // Speed: 700, // debug
        Speed: 300,
        SpeedFast: 450,
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
        SecondOffsetX: -100
    }
x
}