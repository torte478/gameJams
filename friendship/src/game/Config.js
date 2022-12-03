export default class Config {

    static Debug = {
        Global: true,
        Log: true,
        ShowSceneLog: true,
        PlaySound: true,
        Random: false
    };

    static Start = {
        Player: { x: 2550, y: 1850 },
        InsideHub: false,
        GunCharge: 100,
        ContainerSpawn: { x: 2850, y: 1800 },
        EnemyCatcher: {
            x: 2750,
            y: 1400,
            zone: new Phaser.Geom.Rectangle(
                2700,
                1300,
                650,
                600
            )
        },
        HubEnterTrigger: new Phaser.Geom.Rectangle(2075, 1685, 200, 200),
        Containers: [
            { x: 6978, y: 1606 }
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
                r: 150
            },
            {
                x: 4750,
                y: 900,
                r: 225
            },
            {
                x: 7285,
                y: 1650,
                r: 200
            },
            {
                x: 7600,
                y: 1650,
                r: 200
            },
            {
                x: 6100,
                y: 400,
                r: 275
            },
            {
                x: 7620,
                y: 225,
                r: 100
            },
            {
                x: 3450,
                y: 300,
                r: 175
            }
        ]
    };

    static EnemySize = [ 100, 100, 1 ];
    static ContainerCapacity = 1;

    static Hub = {
        Pos: new Phaser.Geom.Point(0, 3000),
        ExitTrigger: new Phaser.Geom.Rectangle(50, 3250, 100, 100),
    }

    static ContainerLimit = 20;
    static GunShotCost = 9;
    static GunChargeSpeed = 2;

    static Physics = {
        ConnectionStep: 200,
        ConnectionMax: 400,
        ConnectionFriction: 150,
        CatcherSpeed: 500,

        Gravity: 600,
        PlayerSpeed: 400,
        PlayerJump: -700,
        BulletSpeed: 600,

        SquareSpeed: 100,

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