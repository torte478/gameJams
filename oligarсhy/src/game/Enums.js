export default class Enums {

    static GameState = {
        UNKNOWN: 0,
        BEGIN: 1,
        FIRST_DICE_TAKED: 2,
        SECOND_DICE_TAKED: 3,
        DICES_DROPED: 4,
        PIECE_TAKED: 5,
        PIECE_ON_FREE_FIELD: 6,
        PIECE_ON_ENEMY_FIELD: 7,
        OWN_FIELD_SELECTED: 8,
        FINAL: 9,
        DARK: 10
    };

    static FieldType = {
        UNKNOW: 0,
        PROPERTY: 1,
        CHANCE: 2,
        TAX: 3,
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

    static Player = {
        NOONE: -1,
        HUMAN: 0,
        AI1: 1,
        AI2: 2,
        AI3: 3,
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

    static ActionType = {
        UNKNOWN: 0,
        MERGE_MONEY: 1,
        SPLIT_MONEY: 2,
        BUY_FIELD: 3,
        BUY_HOUSE: 4,
        SELL_FIELD: 5,
        SELL_HOUSE: 6,
        NEXT_TURN: 7
    };

    static HudState = {
        UNKNOWN: 0,
        HIDDEN: 1,
        MOVING: 2,
        VISIBLE: 3
    }

    static HandAction = {
        UNKNOWN: 0,
        TAKE_DICE: 1,
        DROP_DICES: 2,
        TAKE_PIECE: 3,
        DROP_PIECE: 4,
        TAKE_BILL: 5,
        CLICK_BUTTON: 6
    }

    static AiAction = {
        UNKNOWN: 0,
        FINISH_TURN: 1,
        SPLIT_MONEY: 2,
        MERGE_MONEY: 3,
        BUY_HOUSE: 4,
    }

    static TimerIndex = {
        UNKNOWN: -1,
        TURN: 0,
        LIGHT: 1,
        DARK: 2
    }
}