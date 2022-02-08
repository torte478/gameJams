export default class Enums {

    static GameState = {
        UNKNOWN: 0,
        BEGIN: 10,
        FIRST_DICE_TAKED: 20,
        SECOND_DICE_TAKED: 30,
        DICES_DROPED: 40,
        PIECE_TAKED: 50
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

    static FieldColor = {
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

    static PlayerType = {
        HUMAN: 0,
        CPU1: 1,
        CPU2: 2,
        CPU3: 3
    };

    static HandContent = {
        UNKNOWN: 0,
        EMPTY: 10,
        DICES: 20,
        PIECE: 30
    };
}