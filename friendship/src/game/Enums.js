export default class Enums {
    static Keyboard = {
        LEFT: 0,
        RIGHT: 1,
        UP: 2,
        DOWN: 3,
        FIRE: 4,
        JUMP: 5
    };

    static BulletState = {
        NONE: 0,
        FLY: 1,
        ON_WALL: 2,
        ON_TARGET: 3
    };

    static EnemyType = {
        SQUARE: 0,
        TRIANGLE: 1,
        CIRCLE: 2
    };

    static PlayerAnimation = {
        FIRE: 0
    };

    static CIRCLE_COLOR = {
        BLUE: 0,
        YELLOW: 1,
        RED: 2
    };
}