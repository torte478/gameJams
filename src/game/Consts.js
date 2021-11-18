import Phaser from "../lib/phaser.js";

export default class Consts {

    static playerVelocity = 320;
    static donkeyVelocity = 640;

    static playerSpawn = new Phaser.Geom.Point(
        -180,
        -1894); 
        // -218,
        // -4810);

    static duration = 60;
    static startTime = 0;

    static cameraOffset = 100;
    static backgroundCount = 32;
    static backgroundSize = 1000;

    static arrowCountX = 1;
    static arrowCountY = 4;

    static enableSecondCamera = false;
    static renderClock = false;

    static gameOverTime = 60;

    static levelStartX = -384;
    static secretStartY = -14688;
    static desertStartY = -13728;
    static cityStartY = -5760;

    static distanceEps = 10;
    static botSpeed = 200; //64;

    static unit = 32;
    static danceLength = 3;

    static PlayerHandState = {
        EMPTY: 0,
        CARROT: 1,
        MONEY: 2
    };

    static ItemsFrame = {
        CARROT: 3,
        MONEY: 4
    };

    static CarrotSalerPos = {
        x: -289,
        y: -1909
    };
}