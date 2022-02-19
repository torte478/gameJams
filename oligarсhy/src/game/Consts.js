import Enums from "./Enums.js";

export default class Consts {

    static Viewport = {
        Width: 1000,
        Height: 800
    };

    static Depth = {
        Board: 0,
        Houses: 100,
        Pieces: 200,
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
        }
    };

    static FieldCount = 40;
    static BillCount = 7;

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
        LIGHTBLUE: 4,
        PURPLE: 4,
        ORANGE: 4,
        RED: 4,
        YELLOW: 4,
        GREEN: 4,
        BLUE: 2,
        BROWN: 2,
    };

    static BuyableFieldTypes = [
        Enums.FieldType.PROPERTY,
        Enums.FieldType.RAILSTATION,
        Enums.FieldType.UTILITY
    ];

    static States = {
        Management: [
            Enums.GameState.BEGIN,
            Enums.GameState.PIECE_ON_ENEMY_PROPERTY,
            Enums.GameState.PIECE_ON_FREE_PROPERTY,
            Enums.GameState.FINAL
        ],

        Final: [
            Enums.GameState.PIECE_ON_FREE_PROPERTY,
            Enums.GameState.FINAL
        ],
    };

    static TextColor = '#232429';
    static Font = 'Arial';

    static TextStyle = {
        FieldSmall: {
            color: Consts.TextColor,
            fontFamily: Consts.Font,
            align: 'center',
            fontSize: 18
        },

        FieldMiddle: {
            color: Consts.TextColor,
            fontFamily: Consts.Font,
            align: 'center',
            fontSize: 22
        },

        FieldBig: {
            color: Consts.TextColor,
            fontFamily: Consts.Font,
            align: 'center',
            fontSize: 28
        },
    }
}