import Phaser from "../lib/phaser.js";

import Game from "../scenes/Game.js";

class RectangleLike {
    /** @type {Number} */
    x;
    /** @type {Number} */
    y;
    /** @type {Number} */
    width;
    /** @type {Number} */
    height;
}

export default class Trigger {
    /**
     * @param {Game} scene 
     * @param {RectangleLike} first
     * @param {RectangleLike} second 
     * @param {Function} callbackIn 
     * @param {Function} callbackOut 
     */
    constructor(scene, first, second, callbackIn, callbackOut){
        const me = this;
        me.createZone(scene, first, callbackIn);
        me.createZone(scene, second, callbackOut);
    }

    /**
     * @param {Game} scene 
     * @param {RectangleLike} size 
     * @param {Function} callback 
     */
    createZone(scene, size, callback) {
        const zone = scene.add.zone(size.x, size.y, size.width, size.height);
        scene.physics.world.enable(zone);
        scene.physics.add.overlap(scene.player.container, zone, callback);
    }
}