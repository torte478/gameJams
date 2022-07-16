import Enums from "./Enums.js";

export default class Config {

    static Debug = {
        Global: true,
        Log: true,
        TraceLog: true,
        IgnoreRollAnim: true,
        Random: false
    };

    static BoardSize = 4;

    static Carousel = {
        Start: 1
    };

    static DefaultCards = [
        Enums.Card.DICE_1,

        // Enums.Card.MORE_CARDS,
        // Enums.Card.REROLL,
        // Enums.Card.CARD_PACK,
        // Enums.Card.SKIP_TURN,
    ];

    static Start = [
        { 
            count: 2,
            positions: [ 0 ]
        },
        {
            count: 2,
            positions: [ 0 ]
        },
        // { 
        //     count: 4,
        //     positions: [ ]
        // },
        // {
        //     count: 4,
        //     positions: [ ]
        // }
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