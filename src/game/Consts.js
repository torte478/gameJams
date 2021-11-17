import Phaser from "../lib/phaser.js";

export default class Consts {

    static playerVelocity = 320;
    static donkeyVelocity = 640;

    static playerSpawn = new Phaser.Geom.Point(
        // 0,
        // 0); 
        -218,
        -12056);

    static duration = 60;
    static startTime = 0;

    static cameraOffset = 100;
    static backgroundCount = 32;
    static backgroundSize = 1000;

    static arrowCountX = 1;
    static arrowCountY = 4;

    static enableSecondCamera = false;
    static renderClock = true;

    static gameOverTime = 60;

    static levelStartX = -384;
    static cityStartY = -13000;
    static castleStartY = -14024;
    static secretStartY = -14984;
    static desertStartY = -9000;

    static distanceEps = 10;
    static botSpeed = 200; //64;

    static unit = 32;
    static danceLength = 3;
}