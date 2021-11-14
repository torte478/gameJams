import Phaser from '../lib/phaser.js';

export default class CameraViews {

    /** @type {Phaser.Cameras.Scene2D.Camera} */
    main;

    /** @type {Phaser.Cameras.Scene2D.Camera} */
    second;

    // TODO : types
    target;
    offsetY;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Boolean} secondCamera
     */
    constructor(scene, secondCamera) {
        const me = this;

        me.main = scene.cameras.main;
        me.main.scrollX = scene.scale.width / -2;
        me.offsetY = scene.scale.height / -2
        me.target = scene.player.container; // TODO : to arg
        me.main.roundPixels = true;

        if (secondCamera) {
            const size = 200;
            me.second = scene.cameras.add(0, scene.scale.height - size, size, size);
            me.second.setZoom(0.005);
            me.second.startFollow(scene.player.container);
        }
    }

    update() {
        const me = this;

        me.main.scrollY = me.target.y + me.offsetY;
    }
}