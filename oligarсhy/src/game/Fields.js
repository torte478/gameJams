import Phaser from '../lib/phaser.js';

import Config from './Config.js';
import Consts from './Consts.js';
import Enums from './Enums.js';
import Field from './Field.js';
import Helper from './Helper.js';
import Utils from './Utils.js';

export default class Fields {

    /** @type {Field[]} */
    _fields;

    /**
     * @param {Phaser.GameObjects.GameObjectFactory} factory 
     */
    constructor(factory) {
        const me = this;

        me._fields = [];

        me._createFieldLine(factory, 1, 1, -1, 0, 0, 0);
        me._createFieldLine(factory, -1, 1, 0, -1, 90, 10);
        me._createFieldLine(factory, -1, -1, 1, 0, 180, 20);
        me._createFieldLine(factory, 1, -1, 0, 1, 270, 30);
    }

    /**
     * @param {Number} player
     * @param {Number} from
     * @param {Phaser.Geom.Point} point 
     * @returns {Phaser.Geom.Point}
     */
    tryMoveToFieldAtPoint(player, from, point) {
        const me = this;

        for (let i = 0; i < me._fields.length; ++i) {
            const contains = Phaser.Geom.Rectangle.ContainsPoint(
                me._fields[i].getBounds(),
                point);

            if (contains) {
                return {
                    index: i,
                    position: me.movePiece(player, from, i)
                };
            }
        }

        return null;
    }

    /**
     * @param {Number} player 
     * @param {Number} from
     * @param {Number} to 
     * @returns {Phaser.Geom.Point}
     */
    movePiece(player, from, to) {
        const me = this;

        const target = me._getNextPointConfig(player, from, to);

        const fieldPosition = me._fields[to].toPoint();

        const origin = new Phaser.Geom.Point(
            fieldPosition.x + target.offset.x,
            fieldPosition.y + target.offset.y);

        if (Config.Fields[to].type == Enums.FieldType.JAIL)
            return origin;

        return Phaser.Math.RotateAround(
            origin, 
            fieldPosition.x, 
            fieldPosition.y, 
            Phaser.Math.DegToRad(target.angle));
    }

    /**
     * @param {Number} index 
     * @returns {Phaser.Geom.Point}
     */
    getFieldPosition(index) {
        const me = this;

        return me._fields[index].toPoint();
    }

    /**
     * @param {Phaser.Geom.Point} point 
     * @returns {Number}
     */
    getFieldIndex(point) {
        const me = this;

        return Utils.firstOrDefaultIndex(
            me._fields, 
            (f) => Phaser.Geom.Rectangle.ContainsPoint(
                f.getBounds(),
                point));
    }

    /**
     * @param {Number} index 
     * @param {Number} count 
     * @returns {Phaser.Geom.Point[]}
     */
    getHousePositions(index, count) {
        const me = this;

        const total = (count + 1) * 50;
        const start = -total / 2 + 25;

        const field = me._fields[index].toPoint();

        const positions = [];
        for (let i = 0; i < count + 1; ++i) {
            const point = new Phaser.Geom.Point(
                field.x + start + 50 * i,
                field.y - 95
            );
    
            const angle = Helper.getFieldAngle(index);
    
            const result = Phaser.Math.RotateAround(
                point,
                field.x,
                field.y,
                Phaser.Math.DegToRad(angle)
            );

            positions.push(result);
        }

        return positions;
    }

    _getNextPointConfig(player, from, to) {
        const me = this;

        if (from >= 0)
            me._fields[from].removePiece(player);

        const position = me._fields[to].addPiece(player);

        return {
            offset: me._getPiecePosOffset(to)[position],
            angle: Helper.getFieldAngle(to)
        };
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

        const size = Consts.Sizes.Field;
        const start = (size.Width * (sideLength - 1) + size.Height) / 2;

        const corner = me._createField(
            factory, 
            start * signX,
            start * signY,
            'field_corner',
            angle,
            index);

        me._fields.push(corner);

        const offset = (size.Height + size.Width) / 2; 

        for (let i = 0; i < sideLength - 1; ++i) {

            const field = me._createField(
                factory,
                start * signX + shiftX * (offset + i * size.Width),
                start * signY + shiftY * (offset + i * size.Width),
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

        const container = factory.container(x, y, children)
            .setAngle(angle);
        return new Field(container);
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