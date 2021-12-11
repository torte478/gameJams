export default class Consts {

    static debug = true;
    static showWalls = false;

    static player = {
        startX: 2400,
        startY: 1500, //1000 //1260 //1500,
        speed: 800
    };

    static height = {
        floor: 1500,
        middle: 1250,
        top: 1000
    }

    static triggerDistance = 50;

    static stairType = {
        UP: 1,
        DOWN: 2,
    };

    static worldSize = {
        width: 3000,
        height: 1600
    };

    static viewSize = {
        width: 1000,
        height: 800
    };
}