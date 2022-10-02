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
        Timer: false,
        LevelName: true
    };

    static Timer = 10000;

    static Field = {
        Width: 10,
        Height: 10
    };

    static StartLevelIndex = 0;

    static DebugMines = [
        // [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
        // [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        // [2, 2, 2, 2, 2, 2, 2, 2, 2, 0],
        // [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
        // [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
        // [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
        // [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
        // [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
        // [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
        // [2, 2, 2, 2, 2, 2, 2, 2, 2, 2]

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
            TimerDeathProbability: 10,
            ReserveStartCount: 5,
            StartInCity: false,
            CitizenCount: 50,
            MinCitizenSpeed: 50,
            MaxCitizenSpeed: 100,
        }
    ]
}