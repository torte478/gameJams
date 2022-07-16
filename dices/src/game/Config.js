import Enums from "./Enums.js";

export default class Config {

    static Debug = {
        Global: true,
        Log: true,
        TraceLog: true,
        IgnoreRollAnim: true,
        Random: false
    };

    static BoardSize = 8;

    static Carousel = {
        Min: 1,
        Start: 1,
        Max: 3
    };

    static StartBonuses = [
        Enums.Bonus.DICE_6,
        Enums.Bonus.MORE_CARDS,
        Enums.Bonus.REROLL,
        Enums.Bonus.CARD_PACK
    ];

    static Start = [
        { 
            count: 4,
            positions: []
        },
        {
            count: 4,
            positions: []
        },
        { 
            count: 4,
            positions: [ ]
        },
        {
            count: 4,
            positions: [ ]
        }
    ];

    static DebugWeight = [
        100,
        6,
        5,
        4,
        3,
        2,
        1
    ];

    static PlayerCount = Config.Start.length;
}