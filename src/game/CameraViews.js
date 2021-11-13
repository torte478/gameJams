import Phaser from '../lib/phaser.js';

export default class CameraViews {

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
        me.main.startFollow(scene.player.container);
        me.main.roundPixels = true;

        if (secondCamera) {
            const size = 200;
            me.second = scene.cameras.add(0, scene.scale.height - size, size, size);
            me.second.setZoom(0.005);
            me.second.startFollow(scene.player.container);
        }
    }
}