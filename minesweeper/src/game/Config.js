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
    };

    static Timer = 1000;

    static Field = {
        Width: 10,
        Height: 10
    };

    static StartLevelIndex = 0;

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
    ];

    static Levels = [
        //0
        {
            Mines: 3,
            TimerDeathProbability: 25,
            ReserveStartCount: 5,
            StartInCity: false,
            CitizenCount: 20,
            MinCitizenSpeed: 50,
            MaxCitizenSpeed: 100,
        }
    ]
}