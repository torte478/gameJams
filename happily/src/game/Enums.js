export default class Enums {
    static Keyboard = {
        UNKNOWN: 0,
        LEFT: 1,
        RIGHT: 2,
        JUMP: 3,
        ACTION: 4,
        RESTART: 5
    };

    static PlayerStatus = {
        UNKNOWN: 0,
        GROUNDED: 1,
        JUMP: 2,
        FALL: 3
    }

    static SheState = {
        UNKNOWN: 0,
        IDLE: 1,
        CATCH: 2,
        FLY: 3,
        MOVEMENT: 4,
        WIN: 5,
    }

    static TargetType = {
        IRON: 0,
        KETTLE: 1,
        SINK: 2
    }

    static GameResult = {
        UNKNOWN: 0,
        RESTART: 1,
        WIN: 2,
        LOSE: 3,
        EXIT: 4
    }
}