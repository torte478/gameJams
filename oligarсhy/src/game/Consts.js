import Enums from "./Enums.js";

export default class Consts {

    static Viewport = {
        Width: 1000,
        Height: 800
    };

    static Depth = {
        Board: 0,
        Pieces: 100,
        HUD: 1000,
        Max: 10000
    };

    static SecondDiceOffset = {
        X: 75,
        Y: 10
    };

    static Field = {
        Width: 160,
        Height: 240
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
        ]
    };

    static MoneySize = {
        Width: 360,
        Height: 200
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