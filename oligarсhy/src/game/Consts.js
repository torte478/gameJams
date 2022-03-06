import Enums from "./Enums.js";

export default class Consts {

    static Viewport = {
        Width: 1000,
        Height: 800
    };

    static Depth = {
        Board: 0,
        Money: 50,
        Houses: 100,
        Pieces: 200,
        Cards: 300,
        Hand: 500,
        ActiveItem: 750,
        HUD: 1000,
        Max: 10000
    };

    static SecondDiceOffset = {
        X: 75,
        Y: 10
    };

    static Sizes = {
        Field: {
            Width: 160,
            Height: 240
        },

        Bill: {
            Width: 360,
            Height: 200
        },

        Button: {
            Width: 360,
            Height: 200
        },

        HUD: {
            Width: 200,
            Height: 800
        }
    };

    static FieldCount = 40;
    static  BillCount = 7;

    static PiecePosition = {
        Usual: [
            { x: -30, y: -5},
            { x: 30, y: -5},
            { x: 30, y: 55},
            { x: -30, y: 55}
        ],

        Corner: [
            { x: -55, y: -55},
            { x: 55, y: -55},
            { x: 55, y: 55},
            { x: -55, y: 55}
        ],

        JailOutside: [
            { x: -87, y: -70},
            { x: -87, y: 30},
            { x: -20, y: 85},
            { x: 65, y: 85}
        ],

        JailInside: [
            { x: -20, y: -70},
            { x: 65, y: -70},
            { x: -20, y: 15},
            { x: 65, y: 15}
        ]
    };

    static BillValue = [
        1,
        5,
        10,
        20,
        50,
        100,
        500
    ];

    static PropertyColorCounts = {
        LIGHTBLUE: 3,
        PURPLE: 3,
        ORANGE: 3,
        RED: 3,
        YELLOW: 3,
        GREEN: 3,
        BLUE: 2,
        BROWN: 2,
    };

    static BuyableFieldTypes = [
        Enums.FieldType.PROPERTY,
        Enums.FieldType.RAILSTATION,
        Enums.FieldType.UTILITY
    ];

    static States = {
        SellField: [
            Enums.GameState.PIECE_ON_FREE_PROPERTY,
            Enums.GameState.PIECE_ON_ENEMY_PROPERTY,
            Enums.GameState.FINAL
        ],

        Final: [
            Enums.GameState.PIECE_ON_FREE_PROPERTY,
            Enums.GameState.FINAL
        ],
    };

    static MaxHouseCount = 4;

    static Speed = {
        HandFollow: 300,
        HandAction: 1200,
        HandGrabDuration: 200,

        CardShiftDuration: 1000,
        CardOuterDuration: 2000
    };

    static HandWaitPosition = {
        x: 800,
        y: 1200
    };

    static DicePhysics = {
        Speed: 200
    };

    static DiceZoneRect = {
        x: -650,
        y: -650,
        width: 1300,
        height: 1300
    };

    static JailFieldIndex = 10;

    static FieldTextColor = '#232429';
    static Font = 'Arial';

    static TextStyle = {
        FieldSmall: {
            color: Consts.FieldTextColor,
            fontFamily: Consts.Font,
            align: 'center',
            fontSize: 18
        },

        FieldMiddle: {
            color: Consts.FieldTextColor,
            fontFamily: Consts.Font,
            align: 'center',
            fontSize: 22
        },

        FieldBig: {
            color: Consts.FieldTextColor,
            fontFamily: Consts.Font,
            align: 'center',
            fontSize: 28
        },

        HudMoney: {
            fontSize: 16
        },
    }
}