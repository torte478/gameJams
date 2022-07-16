import Enums from "./Enums.js";

export default class Consts {

    static Viewport = {
        Width: 1024,
        Height: 768
    };

    static Unit = 64;
    static UnitSmall = Consts.Unit / 2;
    static UnitBig = Consts.Unit * 2;

    static Depth = {
        Max: 999999
    };

    static DiceRollTime = 1000;

    static StorageSize = {
        Width: 4 * Consts.UnitSmall,
        Height: Consts.UnitSmall
    };

    static StorageByCorner = [
        { x: 0.5 * Consts.UnitSmall, y: -2.5 * Consts.UnitSmall, sideX: 0, sideY: 0 },
        { x: -3.5 * Consts.UnitSmall, y: -2.5 * Consts.UnitSmall, sideX: 1, sideY: 0 },
        { x: -3.5 * Consts.UnitSmall, y: -0.5 * Consts.UnitSmall, sideX: 1, sideY: 1 },
        { x: 0.5 * Consts.UnitSmall, y: -0.5 * Consts.UnitSmall, sideX: 0, sideY: 1 }
    ];

    static PieceScale = {
        Normal: 1,
        Storage: 0.5
    };

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
}
