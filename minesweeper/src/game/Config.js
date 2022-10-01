export default class Config {

    static Debug = {
        Global: true,
        Log: true,
        ShowSceneLog: false,
        PlaySound: true,
        Random: false,
        Level: true,
        Restart: true,
        Mines: true,
        TweenSpeed: false,
        Timer: true,
    };

    static Timer = 1000;

    static Field = {
        Width: 10,
        Height: 10
    };

    static StartLevelIndex = 0;
    static ReserveMaxSize = 5;

    static DebugMines = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ];

    static Levels = [
        //0
        {
            Mines: 10,
            TimerDeathProbability: 25,
            ReserveStartCount: 3
        }
    ]
}