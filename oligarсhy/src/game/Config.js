import Enums from "./Enums.js";

export default class Config {

    static Debug = {
        Global: true,

        StateLog: true,
        Log: true,
        Random: false,
        SkipHuman: false,
        ShowTextLog: true,
        IgnorePause: true,
        CancelAiBuy: false,
        IgnorePhaseFade: false,
    };

    static PlayerCount = 4;

    static CameraPosition = {
        x: 300,
        y: 400
    };

    static StartPiecePositions = [
        0,
        0,
        0,
        0
    ];

    static StartPlayer = Enums.Player.HUMAN;

    static Money = [5, 1, 2, 1, 1, 4, 2 ];

    // static Money = [ 0, 0, 0, 0, 0, 0, 0 ];

    static Fields = [
        [],
        [],
        [],
        [],
        // [ { index: 1, houses: 4 }, { index: 3, houses: 5 } ],
        // [ 1, 3, 5, 6, 8, 9, 11, 12, 13, 14, 15, 16, 18, 19, 21, 23, 24, 25, 26, 27, 28, 29, 31, 32, 34, 35, 37, 39  ],
    ];

    static Time = {
        TurnSec: 300,
        LightSec: 500,
        DarkSec: 500,
    };
}