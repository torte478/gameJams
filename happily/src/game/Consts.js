export default class Consts {

    static Viewport = {
        Width: 1000,
        Height: 800
    };

    static Unit = {
        Small: 25,
        PlayerWidth: 50,
        PlayerHeight: 75
    };

    static Depth = {
        Background: -1000,
        Foreground: 1000,
        Max: 100000
    };

    static Physics = {
        Gravity: 900,
        VelocityGround: 320,
        VelocityJump: 100,
        Jump: -550,
        FrictionTime: 1000
    };

    static Offset = {
        Fall: Consts.Unit.PlayerHeight * 3
    }

    static CollideTiles = [ 8 ];
}
