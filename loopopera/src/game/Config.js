export default class Config {

    static Debug = {
        Global: true,
        Log: true,
        ShowSceneLog: true,
        PlaySound: true,
        Random: false
    };

    static PlayerPhysics = {
        Gravity: 600,
        Bounce: 0.2,
        GroundSpeed: 500, // 300,
        Jump: -590
    };

    static Camera = {
        OffsetX: -200,
        OffsetY: 200
    }
}