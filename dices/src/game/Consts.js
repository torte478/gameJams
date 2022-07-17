import Enums from "./Enums.js";

export default class Consts {

    static Viewport = {
        Width: 1024,
        Height: 768
    };

    static Undefined = -1;

    static Unit = 64;
    static UnitSmall = Consts.Unit / 2;
    static UnitBig = Consts.Unit * 2;

    static Depth = {
        Background: -100,
        Highlight: 100,
        Piece: 500,
        Max: 999999
    };

    static CardSize = {
        Width: 128,
        Height: 96
    };
    static CarouselPosition = { x: 112, y: 144 };

    static StorageSize = {
        Width: 4 * Consts.UnitSmall,
        Height: Consts.UnitSmall
    };

    static PieceScale = {
        Normal: 1,
        Storage: 0.5
    };

    static DiceSpawnValue = 6;

    static Speed = {
        PieceMovement: 200,
        CarouselMs: 500,
        DiceRollMs: 1000,
        Selection: 750,
        ArrowMs: 750,
        PieceStorageMs: 350
    };

    static AiHardestLevel = 5;
    static MaxAiAttempts = 2;

    static StorageByCorner = [
        { x: 0, y:  -1.25 * Consts.UnitSmall, sideX: 0, sideY: 0 },
        { x: -Consts.StorageSize.Width, y: -1.25 * Consts.UnitSmall, sideX: 1, sideY: 0 },
        { x: -Consts.StorageSize.Width, y: 0.25 * Consts.UnitSmall, sideX: 1, sideY: 1 },
        { x: 0, y: 0.25 * Consts.UnitSmall, sideX: 0, sideY: 1 }
    ];

    static BoosterByCorner = [
        { x: -0.5 * Consts.UnitSmall, y: -2 * Consts.UnitSmall, sideX: 0, sideY: 0 },
        { x: -Consts.StorageSize.Width - 0.5 * Consts.UnitSmall, y: -2 * Consts.UnitSmall, sideX: 1, sideY: 0 },
        { x: -Consts.StorageSize.Width - 0.5 * Consts.UnitSmall, y: Consts.Unit, sideX: 1, sideY: 1 },
        { x: -0.5 * Consts.UnitSmall, y: Consts.Unit, sideX: 0, sideY: 1 }
    ];

    static PlayerCornerByCount = [
        [ 
            Enums.Corner.BOTTOM_RIGHT 
        ],
        [
            Enums.Corner.BOTTOM_RIGHT, 
            Enums.Corner.TOP_LEFT,
        ],
        [
            Enums.Corner.BOTTOM_RIGHT, 
            Enums.Corner.BOTTOM_LEFT,
            Enums.Corner.TOP_LEFT,
        ],
        [
            Enums.Corner.BOTTOM_RIGHT, 
            Enums.Corner.BOTTOM_LEFT,
            Enums.Corner.TOP_LEFT,
            Enums.Corner.TOP_RIGHT
        ]
    ];

    static MainColor = '#FCF8FF';
}
