import Phaser from '../lib/phaser.js';

import Consts from './Consts.js';
import Game from '../scenes/Game.js';

export default class CameraViews {

    /** @type {Phaser.Cameras.Scene2D.Camera} */
    main;

    /** @type {Phaser.Cameras.Scene2D.Camera} */
    second;

    // TODO : types
    target;
    offsetY;

    shake = false;
    fade = false;

    /**
     * @param {Game} scene 
     * @param {Boolean} secondCamera
     */
    constructor(scene, secondCamera) {
        const me = this;

        me.main = scene.cameras.main;
        me.main.scrollX = scene.scale.width / -2;
        me.offsetY = scene.scale.height / -2
        me.main.startFollow(scene.player.container, true, 1, 0.25);
        
        // me.main.setBounds(
        //     scene.scale.width / -2, 
        //     Consts.cityStartY + 16,
        //     scene.scale.width,
        //     4864);

        if (secondCamera) {
            const size = 200;
            me.second = scene.cameras.add(0, scene.scale.height - size, size, size);
            me.second.setZoom(0.01);
            me.second.startFollow(scene.player.container);
        }
    }
}