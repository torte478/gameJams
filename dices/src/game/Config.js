export default class Config {

    static Debug = {
        Global: true,
        Log: true,
        TraceLog: true,
    };

    static BoardSize = 4;

    static Start = [
        { 
            count: 2,
            positions: [ 0, 1 ]
        },
        {
            count: 2,
            positions: [ ]
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

    static PlayerCount = Config.Start.length;
}