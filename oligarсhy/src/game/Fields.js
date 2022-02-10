import Phaser from '../lib/phaser.js';

import Config from './Config.js';
import Consts from './Consts.js';
import Enums from './Enums.js';
import Utils from './Utils.js';

export default class Fields {

    // TODODO: extract Field class
    /** @type {Phaser.GameObjects.Container[]} */
    _fields;

    /** @type {Number[]} */
    _pieces;

    /**
     * @param {Phaser.GameObjects.GameObjectFactory} factory 
     * @param {Number[]} piecePositions
     */
    constructor(factory, piecePositions) {
        const me = this;

        me._fields = [];

        me._createFieldLine(factory, 1, 1, -1, 0, 0, 0);
        me._createFieldLine(factory, -1, 1, 0, -1, 90, 10);
        me._createFieldLine(factory, -1, -1, 1, 0, 180, 20);
        me._createFieldLine(factory, 1, -1, 0, 1, 270, 30);

        me._pieces = [];

        for (let i = 0; i < piecePositions.length; ++i)
            me._pieces.push({field: -1, position: -1});
    }

    /**
     * @param {Number} player
     * @param {Phaser.Geom.Point} point 
     * @returns {Phaser.Geom.Point}
     */
    moveToFieldAtPoint(player, point) {
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

        const target = me._getFreePosition(field);

        me._pieces[player] = {
            field: target.field,
            position: target.position
        };

        const fieldContainer = me._fields[field];

        const origin = new Phaser.Geom.Point(
            fieldContainer.x + target.offset.x,
            fieldContainer.y + target.offset.y);

        if (Config.Fields[field].type == Enums.FieldType.JAIL)
            return origin;

        return Phaser.Math.RotateAround(
            origin, 
            fieldContainer.x, 
            fieldContainer.y, 
            Phaser.Math.DegToRad(target.angle));
    }

    _getFreePosition(field) {
        const me = this;

        for (let position = 0; position < me._pieces.length; ++position) {

            const isFree = Utils.all(
                me._pieces, 
                (p) => p.field != field || p.position != position);

            if (isFree) {
                return {
                    field: field,
                    position: position,
                    offset: me._getPiecePosOffset(field)[position],
                    angle: me._getAngle(field)
                };
            }
        }

        throw `can't find free space on field ${field}`;
    }

    _getAngle(field) {
        const quotient = field / (Consts.FieldCount / 4);

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
     * @param {Number} field 
     */
    _getPiecePosOffset(field) {
        const me = this;

        switch (Config.Fields[field].type) {

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
     * @param {Phaser.GameObjects.GameObjectFactory} factory 
     */
    _createFieldLine(factory, signX, signY, shiftX, shiftY, angle, index) {
        const me = this;

        const sideLength = Consts.FieldCount / 4;

        const start = (Consts.Field.Width * (sideLength - 1) + Consts.Field.Height) / 2;

        const corner = me._createField(
            factory, 
            start * signX,
            start * signY,
            'field_corner',
            angle,
            index);

        me._fields.push(corner);

        const offset = (Consts.Field.Height + Consts.Field.Width) / 2; 

        for (let i = 0; i < sideLength - 1; ++i) {

            const field = me._createField(
                factory,
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
     * @param {Phaser.GameObjects.GameObjectFactory} factory 
     * @param {Number} x 
     * @param {Number} y 
     * @param {String} texture 
     * @param {Number} index 
     * @returns {Phaser.GameObjects.Container}
     */
    _createField(factory, x, y, texture, angle, index) {
        const me = this,
              config = Config.Fields[index],
              content = me._getFieldContent(factory, config),
              children = [ factory.image(0, 0, texture) ].concat(content);

        return factory.container(x, y, children)
            .setAngle(angle);
    }

    /**
     * @param {Phaser.GameObjects.GameObjectFactory} factory 
     * @param {Object} config 
     * @returns {Phaser.GameObjects.GameObject[]}
     */
    _getFieldContent(factory, config) {
        const me = this;

        switch (config.type) {
            case Enums.FieldType.PROPERTY:
                return [
                    factory.image(0, -95, 'field_header', config.color),
                    factory.image(0, 20, 'icons', config.icon),
                    factory.text(0, -40, config.name, Consts.TextStyle.FieldSmall).setOrigin(0.5),
                    factory.text(0, 95, config.cost, Consts.TextStyle.FieldMiddle).setOrigin(0.5)
                ];

            case Enums.FieldType.CHANCE:
                return [
                    factory.image(0, 20, 'icons_big', 0),
                    factory.text(0, -90, 'CHANCE', Consts.TextStyle.FieldBig).setOrigin(0.5)
                ];

            case Enums.FieldType.TAX:
                return [
                    factory.image(0, 0, 'icons_big', 2),
                    factory.text(0, -90, 'TAX', Consts.TextStyle.FieldBig).setOrigin(0.5),
                    factory.text(0, 95, `PAY ${config.cost}`, Consts.TextStyle.FieldMiddle).setOrigin(0.5),
                ];

            case Enums.FieldType.RAILSTATION:
                return [
                    factory.image(0, 0, 'icons_big', 4),
                    factory.text(0, -90, config.name, Consts.TextStyle.FieldMiddle).setOrigin(0.5),
                    factory.text(0, 95, config.cost, Consts.TextStyle.FieldMiddle).setOrigin(0.5)
                ];

            case Enums.FieldType.UTILITY:
                return [
                    factory.image(0, 0, 'icons_big', config.icon),
                    factory.text(0, -90, config.name, Consts.TextStyle.FieldSmall).setOrigin(0.5),
                    factory.text(0, 95, config.cost, Consts.TextStyle.FieldMiddle).setOrigin(0.5)
                ];

            case Enums.FieldType.START:
                return [
                    factory.image(0, 0, 'icons_corner', 0)
                ];

            case Enums.FieldType.JAIL:
                return [
                    factory.image(0, 0, 'icons_corner', 2)
                ];

            case Enums.FieldType.FREE:
                return [
                    factory.image(0, 0, 'icons_corner', 4)
                ];

            case Enums.FieldType.GOTOJAIL:
                return [
                    factory.image(0, 0, 'icons_corner', 6)
                ];

            default:
                throw `Unknown field type ${config.type}`;
        }
    }
}