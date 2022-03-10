import Phaser from '../../lib/phaser.js';

import Config from '../Config.js';
import Consts from '../Consts.js';
import Enums from '../Enums.js';
import Field from './Field.js';
import Helper from '../Helper.js';
import Utils from '../Utils.js';

export default class Fields {

    /** @type {Field[]} */
    _fields;

    constructor(scene) {
        const me = this;

        me._fields = [];

        me._createFieldLine(scene, 1, 1, -1, 0, 0, 0);
        me._createFieldLine(scene, -1, 1, 0, -1, 90, 10);
        me._createFieldLine(scene, -1, -1, 1, 0, 180, 20);
        me._createFieldLine(scene, 1, -1, 0, 1, 270, 30);
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
     * @param {Boolean} inJail
     * @returns {Phaser.Geom.Point}
     */
    movePiece(player, from, to, inJail) {
        const me = this;

        const target = me._getNextPointConfig(player, from, to, inJail);

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

    buyField(index, player) {
        const me = this;

        me._fields[index].buy(player);
    }

    updateRent(index, player, rent) {
        const me = this;

        me._fields[index].updateRent(player, rent);
    }

    sellField(index) {
        const me = this;

        me._fields[index].sell();
    }

    select(index) {
        const me = this;

        me._fields[index].select();
    }

    unselect() {
        const me = this;

        for (let i = 0; i < me._fields.length; ++i)
            me._fields[i].unselect();
    }

    removePiece(field, player) {
        const me = this;

        me._fields[field].removePiece(player);
    }

    _getNextPointConfig(player, from, to, inJail) {
        const me = this;

        if (from >= 0)
            me._fields[from].removePiece(player);

        const position = me._fields[to].addPiece(player);

        return {
            offset: me._getPiecePosOffset(to, inJail)[position],
            angle: Helper.getFieldAngle(to)
        };
    }

    /**
     * @param {Number} field 
     * @param {Boolean} inJail
     */
    _getPiecePosOffset(field, inJail) {
        const me = this;

        switch (Config.Fields[field].type) {

            case Enums.FieldType.START:
            case Enums.FieldType.FREE:
            case Enums.FieldType.GOTOJAIL:
                return Consts.PiecePosition.Corner;

            case Enums.FieldType.JAIL:
                return !!inJail
                    ? Consts.PiecePosition.JailInside
                    : Consts.PiecePosition.JailOutside;

            default:
                return Consts.PiecePosition.Usual;
        }
    }

    _createFieldLine(scene, signX, signY, shiftX, shiftY, angle, index) {
        const me = this;

        const sideLength = Consts.FieldCount / 4;

        const size = Consts.Sizes.Field;
        const start = (size.Width * (sideLength - 1) + size.Height) / 2;

        const corner = new Field(
            scene, 
            start * signX,
            start * signY,
            'field_corner',
            angle,
            index);

        me._fields.push(corner);

        const offset = (size.Height + size.Width) / 2; 

        for (let i = 0; i < sideLength - 1; ++i) {

            const field = new Field(
                scene,
                start * signX + shiftX * (offset + i * size.Width),
                start * signY + shiftY * (offset + i * size.Width),
                'field',
                angle,
                index + i + 1
            );

            me._fields.push(field);
        }
    }
}