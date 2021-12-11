export default class Consts {

    static debug = true;
    static showWalls = false;

    static height = {
        floor: 1500,
        middle: 1250,
        top: 1000,
        roof: 540
    }

    static player = {
        startX: 2100,
        startY: this.height.roof,
        speed: 500
    };

    static triggerDistance = 50;
    static unit = 50;

    static stairType = {
        UP: 1,
        DOWN: 2,
        ROOF: 3
    };

    static levelPhase = {
        START: 1,
        FIGHT: 2
    }

    static startPhase = this.levelPhase.START;

    static worldSize = {
        width: 3000,
        height: 1600
    };

    static viewSize = {
        width: 1000,
        height: 800
    };
}