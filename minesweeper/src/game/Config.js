export default class Config {

    static Debug = {
        Global: true,
        Log: true,
        ShowSceneLog: true,
        PlaySound: true,
        Random: false,
        Level: true,
        Restart: true,
        Mines: false,
        TweenSpeed: false,
        Timer: false,
    };

    static Timer = 10000;

    static Field = {
        Width: 10,
        Height: 10
    };

    static StartLevelIndex = 0;

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
            ReserveStartCount: 5,
            StartInCity: true,
            CitizenCount: 20,
            MinCitizenSpeed: 50,
            MaxCitizenSpeed: 100,
        }
    ]
}