import Enums from "./Enums.js";

export default class Config {

    static Debug = {
        Global: true,
        Log: true,
        TraceLog: true,
        IgnoreRollAnim: false,
        Random: true,
        Level: true,
        BoosterVisible: false,
    };

    static BoardSize = 4;

    static LevelIndex = 5;

    static Start = [
        {
            count: 2,
            positions: [ 11, 10],
        },
        {
            count: 2,
            positions: [ 11, 10 ],
        },
        // { 
        //     count: 4,
        //     positions: [],
        //     skin: 0,
        // },
        // {
        //     count: 4,
        //     positions: [0, 1, 2, 3],
        //     skin: 2,
        // },
        // { 
        //     count: 4,
        //     positions: [0, 1, 2, 3],
        //     skin: 4,
        // },
        // {
        //     count: 4,
        //     positions: [0, 1, 2, 3],
        //     skin: 6,
        // }
    ];

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

    static Levels = [
        { size: 6, ai: [ 0 ], skin: [ 0, 2 ] },
        { size: 4, ai: [ 1 ], skin: [ 0, 2 ] },
        { size: 6, ai: [ 2 ], skin: [ 0, 4 ] },
        { size: 6, ai: [ 2, 3 ], skin: [ 0, 2, 4 ] },
        { size: 8, ai: [ 2, 3, 4 ], skin: [ 0, 2, 4, 6 ] },
        { size: 8, ai: [ 4, 4, 5 ], skin: [ 0, 4, 6, 8 ] },
    ]

    static AI = [
        // 0
        [
            1, //win
            0, //kill human
            0, //kill any
            4, //spawn
            2, //enter home
            3, //inside home
            0, //move from own spawn
            0  //move from enemy spawn
        ],
        // 1
        [
            10, //win
            1, //kill human
            2, //kill any
            4, //spawn
            0, //enter home
            4, //inside home
            1, //move from own spawn
            0  //move from enemy spawn
        ],
        // 2
        [
            10, //win
            4, //kill human
            5, //kill any
            4, //spawn
            3, //enter home
            3, //inside home
            3, //move from own spawn
            3  //move from enemy spawn
        ],
        // 3
        [
            10, //win
            9, //kill human
            9, //kill any
            8, //spawn
            3, //enter home
            4, //inside home
            5, //move from own spawn
            5  //move from enemy spawn
        ],
        // 4
        [
            10, //win
            9, //kill human
            9, //kill any
            8, //spawn
            7, //enter home
            4, //inside home
            6, //move from own spawn
            5  //move from enemy spawn
        ],
        // 5
        [
            0, //win
            500, //kill human
            10, //kill any
            9, //spawn
            11, //enter home
            4, //inside home
            6, //move from own spawn
            2  //move from enemy spawn
        ],
    ]

    static DebugAI = 4;

    static PlayerCount = Config.Start.length;
}