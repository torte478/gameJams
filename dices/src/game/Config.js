export default class Config {

    static Debug = {
        Global: true,
        Log: true,
        TraceLog: true,
    };

    static BoardSize = 4;
    // static BoardSize = 6;
    // static BoardSize = 8;

    static Start = [
        { 
            count: 2,
            positions: [ 0 ]
        },
        {
            count: 2,
            positions: [ 13 ] 
        },
        {
            count: 1,
            positions: [ 1 ]
        }
    ];

    static PlayerCount = Config.Start.length;
}