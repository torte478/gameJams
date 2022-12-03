export default class Config {

    static Debug = {
        Global: true,
        Log: true,
        ShowSceneLog: true,
        PlaySound: true,
        Random: false
    };

    static Start = {
        Player: { x: 2500, y: 800 },
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
            { x: 5722, y: 1550 }
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
        ]
    };

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
    };

    static TrashPosition = {
        x: -1000,
        y: -1000
    };
}