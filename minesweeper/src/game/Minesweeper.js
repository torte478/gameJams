import Phaser from '../lib/phaser.js';
import Config from './Config.js';
import Consts from './Consts.js';
import Field from './Field.js';

export default class Minesweeper {

    /** @type {Phaser.Scene} */
    _scene;

    /** @type {Field} */
    _field;

    /**
     * @param {Phaser.Scene} scene 
     */
    constructor(scene) {
        const me = this;

        me._scene = scene;

        scene.add.image(Consts.Viewport.Width / 2, Consts.Viewport.Height / 2, 'minesweeper_background')
            .setDepth(Consts.Depth.Background);

        
        me._field = new Field(
            scene, 
            (Consts.Viewport.Width - Consts.Unit * Config.Field.Width) / 2, 
            (Consts.Viewport.Height - Consts.Unit * Config.Field.Height) / 2, 
            Config.Field.Width, 
            Config.Field.Height);
    }

    /** @type {Phaser.Geom.Point} */
    update(pointer) {
        const me = this;

        me._field.update(pointer);
    }
}