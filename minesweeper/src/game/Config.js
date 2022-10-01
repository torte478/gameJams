export default class Config {

    static Debug = {
        Global: true,
        Log: true,
        ShowSceneLog: true,
        PlaySound: true,
        Random: false,
        Level: true,
    };

    static Field = {
        Width: 10,
        Height: 10
    };

    static StartLevelIndex = 0;

    static Levels = [
        //0
        {
            Mines: 10
        }
    ]
}