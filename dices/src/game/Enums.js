export default class Enums {

    static Player = {
        HUMAN: 0,
        CPU1: 1,
        CPU2: 2,
        CPU3: 3
    };

    static Corner = {
        UNKNOWN: -1,
        TOP_LEFT: 0,
        TOP_RIGHT: 1,
        BOTTOM_RIGHT: 2,
        BOTTOM_LEFT: 3
    };

    static GameState = {
        DICE_ROLL: 0,
        MAKE_STEP: 1,
        GAME_OVER: 3
    };

    static AiWeight = {
        WIN: 0,
        KILL: 1,
        SPAWN: 2,
        ENTER_HOME: 3,
        INSIDE_HOME: 4,
        MOVE_FROM_OWN_SPAWN: 5,
        MOVE_FROM_ENEMY_SPAWN: 6,
    };

    static Bonus = {
        DICE_1: 1,
        DICE_2: 2,
        DICE_3: 3,
        DICE_4: 4,
        DICE_5: 5,
        DICE_6: 6,
        LESS_CARDS: 7,
        MORE_CARDS: 8,
        CARD_PACK: 9,
        REROLL: 10,
        SKIP_TURN: 11
    }
}