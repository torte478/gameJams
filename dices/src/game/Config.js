export default class Config {

    static Debug = {
        Global: true,
        Log: true,
        TraceLog: true,
        IgnoreRollAnim: true
    };

    static BoardSize = 8;

    static DebugWeight = [
        100,
        6,
        5,
        4,
        3,
        2,
        1
    ];

    static Start = [
        { 
            count: 4,
            positions: [ ]
        },
        {
            count: 4,
            positions: [ ]
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

    static PlayerCount = Config.Start.length;
}