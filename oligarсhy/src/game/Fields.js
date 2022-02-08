import Phaser from '../lib/phaser.js';

import Consts from './Consts.js';
import Enums from './Enums.js';
import Global from './Global.js';
import Utils from './Utils.js';

export default class Fields {

    /** @type {Phaser.GameObjects.Container[]} */
    _fields;

    /** @type {Number[]} */
    _pieces;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Number[]} piecePositions
     */
    constructor(scene, piecePositions) {
        const me = this;

        me._fields = [];

        me._createFieldLine(scene, 1, 1, -1, 0, 0, 0);
        me._createFieldLine(scene, -1, 1, 0, -1, 90, 10);
        me._createFieldLine(scene, -1, -1, 1, 0, 180, 20);
        me._createFieldLine(scene, 1, -1, 0, 1, 270, 30);

        me._pieces = [];

        for (let i = 0; i < piecePositions.length; ++i)
            me._pieces.push({field: -1, position: -1});
    }

    /**
     * @param {Number} player
     * @param {Phaser.Geom.Point} point 
     * @returns {Phaser.Geom.Point}
     */
    findField(player, point) {
        const me = this;

        for (let i = 0; i < me._fields.length; ++i) {
            const contains = Phaser.Geom.Rectangle.ContainsPoint(
                me._fields[i].first.getBounds(),
                point);

            if (contains) {
                return {
                    index: i,
                    position: me.movePiece(player, i)
                };
            }
        }

        return null;
    }

    /**
     * @param {Number} player 
     * @param {Number} field 
     * @returns {Phaser.Geom.Point}
     */
    movePiece(player, field) {
        const me = this;

        const config = me._getPiecePosConfig(player, field);
        me._pieces[player] = config;

        const fieldContainer = me._fields[field];
        const offset = me._getPiecePosOffset(field)[config.position];

        const origin = new Phaser.Geom.Point(
            fieldContainer.x + offset.x,
            fieldContainer.y + offset.y);

        if (Global.Fields[field].type == Enums.FieldType.JAIL)
            return origin;
        
        const angle = me._getAngle(field);

        return Phaser.Math.RotateAround(
            origin, 
            fieldContainer.x, 
            fieldContainer.y, 
            Phaser.Math.DegToRad(angle));
    }

    _getAngle(field) {
        const quotient = field / (Global.FieldCount / 4);

        switch (Math.floor(quotient)) {
            case 0:
                return 0;

            case 1:
                return 90;

            case 2:
                return 180;

            case 3: 
                return 270;

            default:
                throw `can't calculate angle for field ${field}`;
        }
    }

    /**
     * @param {Number} player 
     * @param {Number} field 
     */
    _getPiecePosConfig(player, field) {
        const me = this;

        for (let position = 0; position < me._pieces.length; ++position) {
            if (Utils.all(me._pieces, (p) => p.field != field || p.position != position)) {
                return {
                    field: field,
                    position: position
                };
            }
        }

        throw `can't place player ${player} to field ${field}`;
    }

    /**
     * @param {Number} field 
     */
    _getPiecePosOffset(field) {
        const me = this;

        switch (Global.Fields[field].type) {

            case Enums.FieldType.START:
            case Enums.FieldType.FREE:
            case Enums.FieldType.GOTOJAIL:
                return Consts.PiecePosition.Corner;

            case Enums.FieldType.JAIL:
                return Consts.PiecePosition.JailOutside;

            default:
                return Consts.PiecePosition.Usual;
        }
    }

    /**
     * @param {Phaser.Scene} scene 
     */
    _createFieldLine(scene, signX, signY, shiftX, shiftY, angle, index) {
        const me = this;

        const sideLength = Global.FieldCount / 4;

        const start = (Consts.Field.Width * (sideLength - 1) + Consts.Field.Height) / 2;

        const corner = me._createField(
            scene, 
            start * signX,
            start * signY,
            'field_corner',
            angle,
            index);

        me._fields.push(corner);

        const offset = (Consts.Field.Height + Consts.Field.Width) / 2; 

        for (let i = 0; i < sideLength - 1; ++i) {

            const field = me._createField(
                scene,
                start * signX + shiftX * (offset + i * Consts.Field.Width),
                start * signY + shiftY * (offset + i * Consts.Field.Width),
                'field',
                angle,
                index + i + 1
            )

            me._fields.push(field);
        }
    }

    /**
     * @param {Phaser.Scene} scene 
     * @param {Number} x 
     * @param {Number} y 
     * @param {String} texture 
     * @param {Number} index 
     * @returns {Phaser.GameObjects.Container}
     */
    _createField(scene, x, y, texture, angle, index) {
        const me = this,
              config = Global.Fields[index],
              content = me._getFieldContent(scene, config),
              children = [ scene.add.image(0, 0, texture) ].concat(content);

        return scene.add.container(x, y, children)
            .setAngle(angle);
    }

    /**
     * @param {Phaser.Scene} scene 
     * @param {Object} config 
     * @returns {Phaser.GameObjects.GameObject[]}
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

            case Enums.FieldType.START:
                return [
                    scene.add.image(0, 0, 'icons_corner', 0)
                ];

            case Enums.FieldType.JAIL:
                return [
                    scene.add.image(0, 0, 'icons_corner', 2)
                ];

            case Enums.FieldType.FREE:
                return [
                    scene.add.image(0, 0, 'icons_corner', 4)
                ];

            case Enums.FieldType.GOTOJAIL:
                return [
                    scene.add.image(0, 0, 'icons_corner', 6)
                ];

            default:
                throw `Unknown field type ${config.type}`;
        }
    }
}