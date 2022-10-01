export default class Consts {

    static Viewport = {
        Width: 1024,
        Height: 768
    };

    static Unit = 55;
    static UnitSmall = 20;
    static UnitMiddle = 120;

    static Depth = {
        Background: 0,
        Field: 50000,
        Max: 100000
    };

    static Speed = {
        Spawn: 200,
        SoilderMovement: 400,

    };

    static FieldAlpha = {
        Min: 0.05,
        Max: 1,
        DurationInc: 2000,
        DurationDec: 250
    };

    static Eps = 0.01;

    static Shadow = {
        StartFrame: 2,
        Small: 3,
        Middle: 5,
        Big: 6,
        AnimFramesCount: 3,
        Offset: 8 
    }

    static Explode = {
        BodyHeight: 25,
        BodyDuration: 400
    };
}
