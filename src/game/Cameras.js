import Phaser from '../lib/phaser.js';

export default class Cameras {

    /** @type {Phaser.Cameras.Scene2D.Camera} */
    main;

    /** @type {Phaser.Cameras.Scene2D.Camera} */
    second;

    /**
     * @param {Phaser.Scene} scene 
     */
    constructor(scene) {
        const me = this;

        me.main = scene.cameras.main;
        me.main.startFollow(scene.player.container); // TODO: player?
        me.main.setDeadzone(1500); // TODO

        const size = 200;
        me.second = scene.cameras.add(0, 768 - size, size, size); // TODO
        me.second.setZoom(0.01); // TODO
    }
}