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
        MAKE_STEP: 1
    };
}