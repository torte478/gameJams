export default class Config {

    static Debug = {
        Global: true,
        Log: true,
        ShowSceneLog: true,
        PlaySound: true,
        Random: false
    };

    static Start = {
        Player: { x: 3100, y: 1800 },
        GunCharge: 10,
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
        Containers: [
            { x: 3620, y: 1600 }
        ],
        Squares: [
            { x: 4200, y: 1850 }
        ]
    };

    static ContainerLimit = 20;
    static GunShotCost = 9;

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
    }

    static TrashPosition = {
        x: -1000,
        y: -1000
    };
}