import Enums from './Enums.js';

export default class Config {

    static Debug = {
        Global: true,
        Log: true,
        ShowSceneLog: true,
        PlaySound: true,
        Random: false,
        ShowTrigger: true,
    };

    static Start = {
        Player: { x: 3800, y: 1850 },
        InsideHub: false,
        StartGunCharge: 750,
        MaxGunCharge: 1000,
        ContainerSpawn: { x: 2850, y: 1800 },
        EnemyCatcher: {
            x: 2982,
            y: 1420,
            zone: new Phaser.Geom.Rectangle(
                2700,
                1300,
                650,
                600
            )
        },
        HubEnterTrigger: new Phaser.Geom.Rectangle(2075, 1685, 200, 200),
        Containers: [
            { x: 3800, y: 1600 }
        ],
        Squares: [
            { x: 4200, y: 1850 }
        ],
        Triangles: [
            { 
                pos: { x: 6125, y: 1825 },
                left: 5510,
                right: 6290
            },
            { 
                pos: { x: 7710, y: 1225 },
                left: 7460,
                right: 7610
            },
            { 
                pos: { x: 2445, y: 775 },
                left: 2110,
                right: 2590
            },
        ],
        Circles: [
            {
                x: 3825,
                y: 1125,
                r: 150,
                color: Enums.CIRCLE_COLOR.BLUE
            },
            {
                x: 4750,
                y: 900,
                r: 225,
                color: Enums.CIRCLE_COLOR.YELLOW
            },
            {
                x: 7285,
                y: 1650,
                r: 200,
                color: Enums.CIRCLE_COLOR.RED
            },
            {
                x: 7600,
                y: 1650,
                r: 200,
                color: Enums.CIRCLE_COLOR.BLUE
            },
            {
                x: 6100,
                y: 400,
                r: 275,
                color: Enums.CIRCLE_COLOR.YELLOW
            },
            {
                x: 7620,
                y: 225,
                r: 100,
                color: Enums.CIRCLE_COLOR.RED
            },
            {
                x: 3450,
                y: 300,
                r: 175,
                color: Enums.CIRCLE_COLOR.BLUE
            }
        ]
    };

    static HubAnimationRate = 750;
    static EnemySize = [ 100, 100, 1 ];
    static ContainerCapacity = 3;

    static Hub = {
        Pos: new Phaser.Geom.Point(0, 3000),
        ExitTrigger: new Phaser.Geom.Rectangle(50, 3200, 150, 150),
        FireTrigger: new Phaser.Geom.Rectangle(350, 3175, 100, 200)
    }

    static ContainerLimit = 20;
    static GunShotCost = 9;
    static GunChargeSpeed = 32;

    static Physics = {
        ConnectionStep: 400,
        ConnectionMax: 600,
        ConnectionFriction: 150,
        CatcherSpeed: 500,

        Gravity: 600,
        PlayerSpeed: 400,
        PlayerJump: -700,
        BulletSpeed: 600,

        SquareSpeed: 75,

        TriangleActionDurationMin: 1000,
        TriangleActionDurationMax: 3000,
        TriangleSpeed: 900,

        CircleSpeed: 100
    };

    static TrashPosition = {
        x: -1000,
        y: -1000
    };
}