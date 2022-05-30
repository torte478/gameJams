import Enums from "./Enums.js";

export default class Consts {

    static Viewport = {
        Width: 1000,
        Height: 800
    };

    static Depth = {
        Board: 0,
        SelectedField: 100,
        Money: 500,
        Houses: 1000,
        Pieces: 2000,
        Cards: 3000,
        Hand: 5000,
        ActiveItem: 7500,
        HUD: 10000,
        Fade: 15000,
        PauseFade: 20000,
        Max: 100000
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

    static BillCount = 7;

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
        Sell: [
            Enums.GameState.PIECE_ON_FREE_FIELD,
            Enums.GameState.PIECE_ON_ENEMY_FIELD,
            Enums.GameState.FINAL
        ],

        Final: [
            Enums.GameState.PIECE_ON_FREE_FIELD,
            Enums.GameState.FINAL
        ],
    };

    static MaxHouseCount = 4;

    static Speed = {
        HandFollow: 300,
        HandAction: 1200,
        HandGrabDuration: 200,

        CardShiftDuration: 1000,
        CenterEntranceDuration: 1500,

        Selection: 500,
        PhaseChangeDuration: 1000, //10000,
        PhaseChangeDelay: 0, // 1000
    };

    static HandWaitPosition = {
        x: 800,
        y: 1200
    };

    static DicePhysics = {
        Speed: 200,
        Angle: 100
    };

    static DiceZoneRect = {
        x: -650,
        y: -650,
        width: 1300,
        height: 1300
    };

    static HandMovementOffset = 10;

    static JailFieldIndex = 10;

    static SplitBillLimit = [ 15, 6, 6, 9, 6, 6 ];

    static MaxHandBillCount = 10;

    static ButtonSelectionColor = 0xd4d6e1;

    static FieldTextColorLight = '#232429';
    static FieldTextColorDark = '#d4d6e1';

    static Font = 'Arial';

    static TextStyle = {
        FieldSmallLight: {
            color: Consts.FieldTextColorLight,
            fontFamily: Consts.Font,
            align: 'center',
            fontSize: 18
        },

        FieldSmallDark: {
            color: Consts.FieldTextColorDark,
            fontFamily: Consts.Font,
            align: 'center',
            fontSize: 18
        },

        FieldMiddleLight: {
            color: Consts.FieldTextColorLight,
            fontFamily: Consts.Font,
            align: 'center',
            fontSize: 22
        },

        FieldMiddleDark: {
            color: Consts.FieldTextColorDark,
            fontFamily: Consts.Font,
            align: 'center',
            fontSize: 22
        },

        FieldBigLight: {
            color: Consts.FieldTextColorLight,
            fontFamily: Consts.Font,
            align: 'center',
            fontSize: 28
        },

        FieldBigDark: {
            color: Consts.FieldTextColorDark,
            fontFamily: Consts.Font,
            align: 'center',
            fontSize: 28
        },

        HudMoney: {
            fontSize: 16
        },
    }
}