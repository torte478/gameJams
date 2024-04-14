export default class Enums {
    static Keyboard = {
        LEFT: 0,
        RIGHT: 1,
        UP: 2,
        DOWN: 3,

        MAIN_ACTION: 4,
        SECOND_ACTION: 5,

        RESTART: 6
    }

    static Components = {
        ROAD: 0,
        INTERIOR: 1,
        MONEY: 2,
        STRATEGEM: 3
    }

    static NodeType = {
        UNAVAILABLE: 0,
        PASS: 1,
        SEAT: 2
    }

    static BusStatus = {
        DEPARTURE: 0,
        PREPARE_TO_EXIT: 1,
        EXIT: 2,
        ENTER: 3
    }
    
    static Arrow = {
        UP: 0,
        LEFT: 1,
        DOWN: 2,
        RIGHT: 3
    }

    static StratagemResult = {
        MISS: 0,
        HIT: 1,
        COMPLETE: 2
    }

    static StratagemType = {
        WIN_THE_GAME: 0,
        SHIELD: 1
    }

    static PassengerState = {
        NORMAL: 0,
        READY_TO_PAYMENT: 1,
        PAYMENT: 2,
        EXIT: 3
    }
}