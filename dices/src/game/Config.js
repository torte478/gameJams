export default class Config {

    static Debug = {
        Global: true,
        Log: true,
        TraceLog: true,
        IgnoreRollAnim: true,
        Random: false
    };

    static BoardSize = 4;

    static Start = [
        { 
            count: 2,
            positions: [ ]
        },
        {
            count: 2,
            positions: []
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