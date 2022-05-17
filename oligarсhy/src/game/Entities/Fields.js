import Phaser from '../../lib/phaser.js';

import Consts from '../Consts.js';
import Enums from '../Enums.js';
import Field from './Field.js';
import FieldInfo from '../FieldInfo.js';
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
     * @returns {Object}
     */
    tryMoveToFieldAtPoint(player, from, point) {
        const me = this;

        var to = me.getFieldIndex(point);
        if (to == null)
            return null;

        return {
            index: i,
            position: me.movePiece(player, from, to)
        };
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

        const target = me._movePiece(player, from, to, inJail);

        const fieldPosition = Utils.toPoint(me._fields[to].toGameObject());

        const origin = new Phaser.Geom.Point(
            fieldPosition.x + target.offset.x,
            fieldPosition.y + target.offset.y);

        if (FieldInfo.Config[to].type == Enums.FieldType.JAIL)
            return origin;

        return Phaser.Math.RotateAround(
            origin, 
            fieldPosition.x, 
            fieldPosition.y, 
            Phaser.Math.DegToRad(target.angle));
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
     * @returns {Field}
     */
    at(index) {
        const me = this;

        if (index < 0 || index >= me._fields.length)
            throw `wrong field index ${index}`;

        return me._fields[index];
    }

    /**
     */
    unselectAll() {
        const me = this;

        for (let i = 0; i < me._fields.length; ++i)
            me._fields[i].unselect();
    }

    _movePiece(player, from, to, inJail) {
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
        switch (FieldInfo.Config[field].type) {

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