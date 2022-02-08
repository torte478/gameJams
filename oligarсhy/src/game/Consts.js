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

    static TextColor = '#232429';
    static Font = 'Arial';

    static TextStyle = {
        FieldName: {
            color: Consts.TextColor,
            fontFamily: Consts.Font,
            align: 'center',
            fontSize: 18
        },

        FieldCost: {
            color: Consts.TextColor,
            fontFamily: Consts.Font,
            align: 'center',
            fontSize: 22
        },

        ChanceHeader: {
            color: Consts.TextColor,
            fontFamily: Consts.Font,
            align: 'center',
            fontSize: 28
        },
    }
}