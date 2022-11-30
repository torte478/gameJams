export default class Config {

    static Debug = {
        Global: false,
        Log: true,
        ShowSceneLog: false,
        MuteSound: false,
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

    static StartLevelIndex = 2;

    static DebugMines = [
        [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [2, 2, 2, 2, 2, 2, 2, 2, 2, 0],
        [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
        [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
        [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
        [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
        [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
        [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
        [2, 2, 2, 2, 2, 2, 2, 2, 2, 2]

        // [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        // [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        // [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        // [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        // [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        // [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        // [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        // [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        // [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        // [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ];

    static Levels = [
        //0
        {
            Mines: 10,
            TimerDeathProbability: 25,
            ReserveStartCount: 1,
            StartInCity: false,
            CitizenCount: 50,
            MinCitizenSpeed: 50,
            MaxCitizenSpeed: 100,
        },
        //1
        {
            Mines: 20,
            TimerDeathProbability: 40,
            ReserveStartCount: 0,
            StartInCity: true,
            CitizenCount: 30,
            MinCitizenSpeed: 300,
            MaxCitizenSpeed: 300,
        },
        //2
        {
            Mines: 8,
            TimerDeathProbability: 100,
            ReserveStartCount: 0,
            StartInCity: true,
            CitizenCount: 1,
            MinCitizenSpeed: 500,
            MaxCitizenSpeed: 500,
        },
    ]
}