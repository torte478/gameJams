import Phaser from '../lib/phaser.js';

import Consts from './Consts.js';
import Enums from './Enums.js';
import Global from './Global.js';

export default class Fields {

    /** @type {Array} */
    _fields;

    /**
     * @param {Phaser.Scene} scene 
     */
    constructor(scene) {
        const me = this;

        me._fields = [];

        me._createFieldLine(scene, 1, 1, -1, 0, 0, 0);
        me._createFieldLine(scene, -1, 1, 0, -1, 90, 10);
        me._createFieldLine(scene, -1, -1, 1, 0, 180, 20);
        me._createFieldLine(scene, 1, -1, 0, 1, 270, 30);
    }

    /**
     * @param {Phaser.Scene} scene 
     */
    _createFieldLine(scene, signX, signY, shiftX, shiftY, angle, index) {
        const me = this;

        const start = (Consts.Field.Width * (Global.FieldUnit - 1) + Consts.Field.Height) / 2;

        const corner = scene.add.container(
            start * signX,
            start * signY,
            [
                scene.add.image(0, 0, 'field_corner')
            ])
            .setAngle(angle);

        me._fields.push(corner);

        const offset = (Consts.Field.Height + Consts.Field.Width) / 2; 

        for (let i = 0; i < Global.FieldUnit - 1; ++i) {
            const config = Global.Fields[index + i + 1] || Global.Fields[1]; // TODO

            const content = me._getFieldContent(scene, config);

            const field = scene.add.container(
                start * signX + shiftX * (offset + i * Consts.Field.Width),
                start * signY + shiftY * (offset + i * Consts.Field.Width),
                [ scene.add.image(0, 0, 'field') ].concat(content))
                .setAngle(angle)

            me._fields.push(field);
        }
    }

    /**
     * @param {Phaser.Scene} scene 
     * @param {Object} config 
     */
    _getFieldContent(scene, config) {
        const me = this;

        switch (config.type) {
            case Enums.FieldType.PROPERTY:
                return [
                    scene.add.image(0, -95, 'field_header', config.color),
                    scene.add.image(0, 20, 'icons', config.icon),
                    scene.add.text(0, -40, config.name, Consts.TextStyle.FieldName).setOrigin(0.5),
                    scene.add.text(0, 95, config.cost, Consts.TextStyle.FieldCost).setOrigin(0.5)
                ];

            case Enums.FieldType.CHANCE:
                return [
                    scene.add.image(0, 20, 'icons_big', 0),
                    scene.add.text(0, -90, 'CHANCE', Consts.TextStyle.ChanceHeader).setOrigin(0.5)
                ];

            case Enums.FieldType.TAX:
                return [
                    scene.add.image(0, 0, 'icons_big', 2),
                    scene.add.text(0, -90, 'TAX', Consts.TextStyle.ChanceHeader).setOrigin(0.5),
                    scene.add.text(0, 95, `PAY ${config.cost}`, Consts.TextStyle.FieldCost).setOrigin(0.5),
                ];

            case Enums.FieldType.RAILSTATION:
                return [
                    scene.add.image(0, 0, 'icons_big', 4),
                    scene.add.text(0, -90, config.name, Consts.TextStyle.FieldCost).setOrigin(0.5), //TODO : text style name
                    scene.add.text(0, 95, config.cost, Consts.TextStyle.FieldCost).setOrigin(0.5)
                ];

            case Enums.FieldType.UTILITY:
                return [
                    scene.add.image(0, 0, 'icons_big', config.icon),
                    scene.add.text(0, -90, config.name, Consts.TextStyle.FieldName).setOrigin(0.5),
                    scene.add.text(0, 95, config.cost, Consts.TextStyle.FieldCost).setOrigin(0.5)
                ];

            default:
                throw `Unknown field type ${config.type}`;
        }
    }
}