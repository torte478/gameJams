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
