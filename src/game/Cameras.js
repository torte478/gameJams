import Phaser from '../lib/phaser.js';

export default class Cameras {

    /** @type {Phaser.Cameras.Scene2D.Camera} */
    main;

    /** @type {Phaser.Cameras.Scene2D.Camera} */
    second;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Boolean} secondCamera
     */
    constructor(scene, secondCamera) {
        const me = this;

        me.main = scene.cameras.main;
        me.main.startFollow(scene.player.container); // TODO: player?
        // me.main.setDeadzone(1500); // TODO

        if (secondCamera) {
            const size = 200;
            me.second = scene.cameras.add(0, 768 - size, size, size); // TODO
            me.second.setZoom(0.005); // TODO
            me.second.startFollow(scene.player.container);
        }
    }
}