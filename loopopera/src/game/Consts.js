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
        Tiles: 100,
        Boss: 500,
        Player: 1000,
        Hands: 2000,
        Foreground: 10000,
        Max: 100000
    };

    static Positions = {
        GraveX: 1500,
        PentagramX: 4500,
        PentagramExitX: 5700,
        GroundY: 1390,
        FinalUndergroundX: 7800,
        HandsStartX: 400, 
        HandsStartY: 2440,
        BossStartX: 7200,
    }

    static Tiles = {
        UndegroundEnter: [ 
            { x: 32, y: 28, tile: 12 },
            { x: 33, y: 28, tile: 12 },
            { x: 34, y: 28, tile: 12 },

            { x: 32, y: 29, tile: 22 },
            { x: 33, y: 29, tile: 22 },
            { x: 34, y: 29, tile: 22 },
        ],
        UndegroundFirstWallUp: [
            { x: 64, y: 36, tile: 7 },
            { x: 64, y: 37, tile: 7 },
            { x: 64, y: 38, tile: 7 },
        ],
        UndegroundFirstWallDown: [
            { x: 64, y: 40, tile: 7 },
            { x: 64, y: 41, tile: 7 },
            { x: 64, y: 42, tile: 7 },
        ],
        UndegroundSecondWallUp: [
            { x: 89, y: 36, tile: 7 },
            { x: 89, y: 37, tile: 7 },
            { x: 89, y: 38, tile: 7 },
        ],
        UndegroundSecondWallDown: [
            { x: 89, y: 40, tile: 7 },
            { x: 89, y: 41, tile: 7 },
            { x: 89, y: 42, tile: 7 },
        ],
        UndegroundThirdWallUp: [
            { x: 119, y: 36, tile: 7 },
            { x: 119, y: 37, tile: 7 },
            { x: 119, y: 38, tile: 7 },
        ],
        UndegroundThirdWallDown: [
            { x: 119, y: 40, tile: 7 },
            { x: 119, y: 41, tile: 7 },
            { x: 119, y: 42, tile: 7 },
        ],
        UndegroundExit: [
            { x: 138, y: 28, tile: 12 },
            { x: 139, y: 28, tile: 12 },
            { x: 140, y: 28, tile: 12 },
            { x: 141, y: 28, tile: 12 },

            { x: 138, y: 29, tile: 22 },
            { x: 139, y: 29, tile: 22 },
            { x: 140, y: 29, tile: 22 },
            { x: 141, y: 29, tile: 22 },

        ],
        FinalUndegroundEnter: [
            { x: 161, y: 28, tile: 12 },
            { x: 162, y: 28, tile: 12 },
            { x: 163, y: 28, tile: 12 },

            { x: 161, y: 29, tile: 22 },
            { x: 162, y: 29, tile: 22 },
            { x: 163, y: 29, tile: 22 },
        ],
        FinalUndegroundExit: [  
            { x: 120, y: 43, tile: 22 },
            { x: 121, y: 43, tile: 22 },
            { x: 122, y: 43, tile: 22 },
            { x: 123, y: 43, tile: 22 },
            { x: 124, y: 43, tile: 22 },
        ]
    }
}
