import Phaser from "../lib/phaser.js";

export default class Consts {

    static playerVelocity = 320;
    static donkeyVelocity = 640;

    static playerSpawn = new Phaser.Geom.Point(
        0, // -218,
        -9200); //-12056);

    static duration = 60;
    static startTime = 0;

    static cameraOffset = 100;
    static backgroundCount = 4;
    static backgroundSize = 8000;

    static arrowCountX = 1;
    static arrowCountY = 4;

    static enableSecondCamera = false;
    static renderClock = false;

    static gameOverTime = 60;

    static levelStartX = -384;
    static cityStartY = -13000;

    static distanceEps = 10;
    static botSpeed = 200; //64;

    static unit = 32;
    static danceLength = 3;
}