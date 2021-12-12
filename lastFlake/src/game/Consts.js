export default class Consts {

    static levelPhase = {
        START: 1,
        FIGHT: 2
    }

    static debug = true;
    static showWalls = false;
    static startPhase = this.levelPhase.FIGHT;

    static height = {
        floor: 1500,
        middle: 1250,
        top: 1000,
        roof: 540
    }

    static player = {
        startX: 500,
        startY: this.height.floor,
        speed: 500
    };

    static botSpeed = 300; // 500;
    static snowSpeed = 100; //50;
    static timerDuration = 100;
    static startLevel = 0;
    static botLock = true;
    static skinOffset = 7;

    static eatZones = [
        [ 
            { from: 310, to: 670, in: 288, out: 685 }, 
            { from: 2280, to: 2430, in: 2265, out: 2440 }, 
            { from: 2710, to: 2860, in: 2675, out: 2870 } 
        ],
        [ 
            { from: 120, to: 1100, in: 70, out: 405 }, 
            { from: 2080, to: 2840, in: 2925, out: 2065}
        ],
        [
            { from: 100, to: 2900, in: 70 }
        ]
    ];

    static graphLinks = [
        [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
        [0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0]
    ];

    static graphPoints = [
        { x: 286, y: this.height.top },
        { x: 677, y: this.height.top },
        { x: 2260, y: this.height.top },
        { x: 2430, y: this.height.top },
        { x: 2690, y: this.height.top },
        { x: 2870, y: this.height.top },
        { x: 75, y: this.height.middle },
        { x: 286, y: this.height.middle },
        { x: 677, y: this.height.middle },
        { x: 2060, y: this.height.middle },
        { x: 2260, y: this.height.middle },
        { x: 2439, y: this.height.middle },
        { x: 2690, y: this.height.middle },
        { x: 2870, y: this.height.middle },
        { x: 75, y: this.height.floor },
        { x: 286, y: this.height.floor },
        { x: 2060, y: this.height.floor },
        { x: 2870, y: this.height.floor }
    ];

    static triggerDistance = 50;
    static unit = 50;

    static stairType = {
        UP: 1,
        DOWN: 2,
        ROOF: 3
    };

    static levelType = {
        TOP: 0,
        MIDDLE: 1,
        FLOOR: 2
    };

    static worldSize = {
        width: 3000,
        height: 1600
    };

    static viewSize = {
        width: 1000,
        height: 800
    };
}