export default class Consts {

    static Viewport = {
        Width: 1000,
        Height: 800
    };

    static Unit = {
        Normal: 50,
        Small: 25,
        Big: 100
    };

    static Depth = {
        Background: -100,
        Tiles: 0,
        Player: 1000,
        Foreground: 10000,
        Max: 100000
    };

    static Positions = {
        GraveX: 1500,
        PentagramX: 4500,
        PentagramExitX: 5700,
        GroundY: 1390
    }

    static Tiles = {
        UndegroundEnter: [ 
            { x: 32, y: 29 },
            { x: 33, y: 29 },
            { x: 34, y: 29 },
        ],
        UndegroundFirstWallUp: [
            { x: 64, y: 36 },
            { x: 64, y: 37 },
            { x: 64, y: 38 },
        ],
        UndegroundFirstWallDown: [
            { x: 64, y: 40 },
            { x: 64, y: 41 },
            { x: 64, y: 42 },
        ],
        UndegroundSecondWallUp: [
            { x: 89, y: 36 },
            { x: 89, y: 37 },
            { x: 89, y: 38 },
        ],
        UndegroundSecondWallDown: [
            { x: 89, y: 40 },
            { x: 89, y: 41 },
            { x: 89, y: 42 },
        ],
        UndegroundThirdWallUp: [
            { x: 119, y: 36 },
            { x: 119, y: 37 },
            { x: 119, y: 38 },
        ],
        UndegroundThirdWallDown: [
            { x: 119, y: 40 },
            { x: 119, y: 41 },
            { x: 119, y: 42 },
        ],
        UndegroundExit: [
            { x: 138, y: 29 },
            { x: 139, y: 29 },
            { x: 140, y: 29 },
            { x: 141, y: 29 },

        ],
        FinalUndegroundEnter: [
            { x: 161, y: 29 },
            { x: 162, y: 29 },
            { x: 163, y: 29 },
        ],
        FinalUndegroundExit: [  
            { x: 120, y: 43 },
            { x: 121, y: 43 },
            { x: 122, y: 43 },
            { x: 123, y: 43 },
            { x: 124, y: 43 },
        ]
    }
}
