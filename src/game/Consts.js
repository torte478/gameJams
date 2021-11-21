import Phaser from "../lib/phaser.js";

export default class Consts {

    static playerVelocity = 320;
    static donkeyVelocity = 640;

    static playerSpawn = new Phaser.Geom.Point(
        0, 
        -1000); 
        // -218,
        // -4810);

    static duration = 60;

    static cameraOffset = 100;
    static backgroundCount = 32;
    static backgroundSize = 1000;

    static arrowCountX = 1;
    static arrowCountY = 4;
  
    static enableSecondCamera = false;
    static renderClock = false;
    static renderArrows = false;
    static playTheme = false;

    static levelStartX = -384;
    static secretStartY = -14688;
    static desertStartY = -13728;
    static cityStartY = -5760;

    static distanceEps = 10;
    static botSpeed = 200; //64;

    static unit = 32;
    static danceLength = 3;

    static playerHandState = {
        EMPTY: 0,
        CARROT: 1,
        MONEY: 2,
        DONKEY: 3,
        ICECREAM: 4,
        KEY: 5
    };

    static itemsFrame = {
        CARROT: 3,
        MONEY: 4,
        DONKEY: 10,
        ICECREAM: 11,
        KEY: 12,
    };

    static carrotSalerPos = {
        x: -289,
        y: -1909
    };

    static icecreamSalerPos = {
        x: 0,
        y: -3264
    }

    static guardPos = {
        x: -40, 
        y: -5674
    }

    static kingPos = {
        x: 0, 
        y: -1152
    }

    static times = {
        start: 0,
        king: 45,
        startShaking: 54,
        startFade: 57,
        stopFade: 60,
        gameEnd: 63
    }
}