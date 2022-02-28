export default class Enums {

    static GameState = {
        UNKNOWN: 0,
        BEGIN: 1,
        FIRST_DICE_TAKED: 2,
        SECOND_DICE_TAKED: 3,
        DICES_DROPED: 4,
        PIECE_TAKED: 5,
        PIECE_ON_FREE_PROPERTY: 6,
        PIECE_ON_ENEMY_PROPERTY: 7,
        OWN_FIELD_SELECTED: 8,
        FINAL: 9
    };

    static FieldType = {
        UNKNOW: 0,
        PROPERTY: 1,
        CHANCE: 2,
        TAX: 30,
        RAILSTATION: 4,
        JAIL: 5,
        UTILITY: 6,
        FREE: 7,
        GOTOJAIL: 8,
        START: 9
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
        EMPTY: 1,
        DICES: 2,
        PIECE: 3,
        MONEY: 4
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

    static HudState = {
        UNKNOWN: 0,
        HIDDEN: 1,
        MOVING: 2,
        VISIBLE: 3
    }
}