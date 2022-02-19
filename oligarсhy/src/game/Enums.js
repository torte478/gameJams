export default class Enums {

    static GameState = {
        UNKNOWN: 0,
        BEGIN: 10,
        FIRST_DICE_TAKED: 20,
        SECOND_DICE_TAKED: 30,
        DICES_DROPED: 40,
        PIECE_TAKED: 50,
        PIECE_ON_FREE_PROPERTY: 60,
        PIECE_ON_ENEMY_PROPERTY: 70,
        OWN_FIELD_SELECTED: 80,
        FINAL: 90
    };

    static FieldType = {
        UNKNOW: 0,
        PROPERTY: 10,
        CHANCE: 20,
        TAX: 30,
        RAILSTATION: 40,
        JAIL: 50,
        UTILITY: 60,
        FREE: 70,
        GOTOJAIL: 80,
        START: 90
    };

    static FieldColorIndex = {
        UNKNOWN: 0,
        LIGHTBLUE: 1,
        PURPLE: 2,
        ORANGE: 3,
        RED: 4,
        YELLOW: 5,
        GREEN: 6,
        BLUE: 7,
        BROWN: 8,
    };

    static PlayerIndex = {
        NOONE: -1,
        HUMAN: 0,
        CPU1: 1,
        CPU2: 2,
        CPU3: 3,
    };

    static HandState = {
        UNKNOWN: 0,
        EMPTY: 10,
        DICES: 20,
        PIECE: 30,
        MONEY: 40
    };

    static Money = {
        M1: 0,
        M5: 1,
        M10: 2,
        M20: 3,
        M50: 4,
        M100: 5,
        M500: 6
    }

    static PropertyRentIndex = {
        BASE: 0,
        COLOR: 1,
        ONE: 2,
        TWO: 3,
        THREE: 4,
        FOUR: 5,
        HOTEL: 6
    }

    static ButtonType = {
        UNKNOWN: 0,
        NEXT_TURN: 1,
        BUY_FIELD: 2,
        BUY_HOUSE: 3,
        BUY_HOTEL: 4,
        SELL: 5,
    };
}