import Phaser from '../../lib/phaser.js';
import Consts from '../Consts.js';

export default class City {

    /** @type {Phaser.Scene} */
    _scene;

    /**
     * @param {Phaser.Scene} scene 
     */
    constructor(scene) {
        const me = this;

        me._scene = scene;

        scene.add.image(-Consts.Viewport.Width / 2, Consts.Viewport.Height / 2, 'city_background')
            .setDepth(Consts.Depth.Background);
    }
}