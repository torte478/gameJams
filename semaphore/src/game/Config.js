import { LevelModel } from "./Models.js";

export default class Config {

    static Debug = {
        Global: true,
        Log: true,
        ShowSceneLog: true,
        PlaySound: true,
        Random: true,
        Level: 0,
    };

    /** @type {LevelModel[]} */
    static Levels = [

        // 0 - main menu
        {
            message: 'UNDEFINED',
            isMainMenu: true,
            sinXCoefs: { amplitude: 0 },
            sinYCoefs: { amplitude: 0 },
            sinAngleCoefs: { amplitude: 0 },
        },
        // 1
        {
            message: 'yy',

            sinYCoefs: {
                min: 0,
                max: 200,
                a: 1,
                b: 1.66,
                amplitude: 1,
                start: 0
            },
            sinXCoefs: {
                min: -100,
                max: 100,
                a: 1,
                b: 1.33,
                amplitude: 1,
                start: 123
            },
            sinAngleCoefs: {
                min: -30,
                max: 30,
                a: 1,
                b: 1.72,
                amplitude: 1,
                start: 321
            },
        }
    ];
}