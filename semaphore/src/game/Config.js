import { LevelModel } from "./Models.js";

export default class Config {

    static Debug = {
        Global: true,
        Log: true,
        ShowSceneLog: false,
        PlaySound: true,
        Random: false,
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
        // 1 - tutorial
        {
            message: 'ludum_dare_53',
            isTutorial: true,
            sinXCoefs: { amplitude: 0 },
            sinYCoefs: { amplitude: 0 },
            sinAngleCoefs: { amplitude: 0 },
            signalTimeout: 120000,
            bonusTimeMs: 120 * 1000,
        },
        // 2 - sea seagull little
        {
            message: '30_april_2023',

            sinYCoefs: {
                min: -25,
                max: 25,
                a: 1,
                b: 1.66,
                amplitude: 1,
                start: 0
            },
            sinXCoefs: {
                min: -25,
                max: 25,
                a: 1,
                b: 1.33,
                amplitude: 1,
                start: 123
            },
            sinAngleCoefs: {
                min: -2,
                max: 2,
                a: 1,
                b: 1.72,
                amplitude: 1,
                start: 321
            },
            signalTimeout: 30 * 1000,
            bonusTimeMs: 4 * 60 * 1000,
            isSeagullSmall: true,
        },
        // 3 - seagull big
        {
            message: 'do_the_harlem_shake',

            sinYCoefs: {
                min: -50,
                max: 50,
                a: 1,
                b: 1.66,
                amplitude: 1,
                start: 4
            },
            sinXCoefs: {
                min: -35,
                max: 35,
                a: 1,
                b: 1.33,
                amplitude: 1,
                start: 777
            },
            sinAngleCoefs: {
                min: -5,
                max: 5,
                a: 1,
                b: 1.72,
                amplitude: 1,
                start: 423
            },
            signalTimeout: 15 * 1000,
            bonusTimeMs: 3 * 60 * 1000,
            isSeagullSmall: true,
            isSeagullBig: true,
        },
        // 4 - seagul poop
        {
            message: 'lost_4_8_15_16_23_42',

            sinYCoefs: {
                min: -100,
                max: 100,
                a: 1,
                b: 1.66,
                amplitude: 1,
                start: 42
            },
            sinXCoefs: {
                min: -50,
                max: 50,
                a: 1,
                b: 1.33,
                amplitude: 1,
                start: 321
            },
            sinAngleCoefs: {
                min: -12,
                max: 12,
                a: 1,
                b: 1.72,
                amplitude: 1,
                start: 123
            },
            signalTimeout: 10 * 1000,
            bonusTimeMs: 3 * 60 * 1000,
            isSeagullSmall: true,
            isSeagullBig: true,
            isSeagullPoop: true,
        },
        // 5 - rain and lightning
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
            signalTimeout: 10000,
            bonusTimeMs: 1000,
            isSeagullSmall: true,
            isSeagullBig: true,
            isSeagullPoop: true,
        },
        // 6 - final
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
            signalTimeout: 10000,
            bonusTimeMs: 1000,
            isSeagullSmall: true,
            isSeagullBig: true,
            isSeagullPoop: true,
        }
    ];
}