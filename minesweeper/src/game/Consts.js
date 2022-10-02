export default class Consts {

    static Viewport = {
        Width: 1024,
        Height: 768
    };

    static Unit = 55;
    static UnitSmall = 20;
    static UnitMiddle = 120;

    static Depth = {
        Background: -1000,
        FieldBackground: -500,
        CitizenBottom: 500,
        Field: 50000,
        UI: 65000,
        Max: 100000
    };

    static Speed = {
        Spawn: 200,
        SoilderMovement: 400,
        Shot: 7000,
        Reserve: 750,
        Camera: 1000,
    };

    static FieldAlpha = {
        Min: 0.05,
        Max: 1,
        DurationInc: 2000,
        DurationDec: 2000,
        DurationDecForce: 250
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

    static ReserveMaxSize = 5;
    
    static Citizen = {
        SkinCount: 4,
        SkinLength: 4,
        MaxCountPerScreen: 10,
        LeftX: -850,
        RightX: -100,
        UpY: 300,
        DownY: 450
    };
}
