export default class Consts {

    static levelPhase = {
        START: 1,
        FIGHT: 2
    }

    static debug = true;
    static showWalls = false;
    static startPhase = this.levelPhase.FIGHT;

    static height = {
        floor: 1500,
        middle: 1250,
        top: 1000,
        roof: 540
    }

    static player = {
        startX: 1500,
        startY: this.height.floor,
        speed: 500
    };

    static botSpeed = 500;

    static triggerDistance = 50;
    static unit = 50;

    static stairType = {
        UP: 1,
        DOWN: 2,
        ROOF: 3
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