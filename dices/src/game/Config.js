export default class Config {

    static Debug = {
        Global: true,
        Log: true,
        TraceLog: true,
    };

    static BoardSize = 8;

    static Start = [
        { 
            count: 4,
            positions: [ 1, 2 ]
        },
        {
            count: 2,
            positions: [ 5 ]
        },
        // {
        //     count: 2,
        //     positions: []
        // },
        // { 
        //     count: 1,
        //     positions: []
        // }
    ];

    static PlayerCount = Config.Start.length;
}