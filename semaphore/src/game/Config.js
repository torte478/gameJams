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
            message: 'torte_478_the_best',

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
        },
        // 4 - seagul poop
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
        }
    ];
}