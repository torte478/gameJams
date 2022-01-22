import Phaser from '../lib/phaser.js';
import Consts from './Consts.js';

import Global from './Global.js';

export default class Field {

    /** @type {Array} */
    _sprites;

    /**
     * @param {Phaser.Scene} scene 
     */
    constructor(scene) {
        const me = this;

        me._sprites = [];

        me._createFieldLine(scene, 1, 1, -1, 0, 0);
        me._createFieldLine(scene, -1, 1, 0, -1, 90);
        me._createFieldLine(scene, -1, -1, 1, 0, 180);
        me._createFieldLine(scene, 1, -1, 0, 1, 270);
    }

    /**
     * @param {Phaser.Scene} scene 
     * @param {Number} signX 
     */
    _createFieldLine(scene, signX, signY, shiftX, shiftY, angle) {
        const me = this;

        const start = (Consts.Field.Width * (Global.FieldUnit - 1) + Consts.Field.Height) / 2;
        const corner = scene.add.image(
            start * signX,
            start * signY,
            'field_corner')
            .setAngle(angle);

        me._sprites.push(corner);

        const offset = (Consts.Field.Height + Consts.Field.Width) / 2; 

        for (let i = 0; i < Global.FieldUnit - 1; ++i) {
            const sprite = scene.add.image(
                start * signX + shiftX * (offset + i * Consts.Field.Width),
                start * signY + shiftY * (offset + i * Consts.Field.Width),
                'field')
                .setAngle(angle);

            me._sprites.push(sprite);
        }
    }
}