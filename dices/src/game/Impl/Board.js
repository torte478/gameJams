import Phaser from '../../lib/phaser.js';

import Config from '../Config.js';
import Consts from '../Consts.js';
import Enums from '../Enums.js';
import Utils from '../Utils.js';
import Cell from './Cell.js';

export default class Board {

    /** @type {Phaser.Geom.Point} */
    _position;

    /** @type {Number} */
    _size;

    /** @type {Number} */
    _side;

    /** @type {Object[]} */
    _corners;

    /** @type {Number} */
    _playerCount;

    /** @type {Phaser.GameObjects.Image} */
    _arrow;

    /** @type {Phaser.Scene} */
    _scene;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Number} size 
     * @param {Number} playerCount
     */
    constructor(scene, size, playerCount) {
        const me = this;

        me._scene = scene;
        me._size = size;
        me._playerCount = playerCount;
        me._side = (size * 2 + 2) * Consts.UnitSmall;
        me._position = Utils.buildPoint(
            (Consts.Viewport.Width - me._side) / 2,
            (Consts.Viewport.Height - me._side) / 2);

        const array = me._buildTileArray(size);

        const map = scene.make.tilemap({ 
            data: array, 
            tileWidth: Consts.UnitSmall, 
            tileHeight: Consts.UnitSmall });
        const tiles = map.addTilesetImage('board');
        const layer = map.createLayer(0, tiles, me._position.x, me._position.y);

        me._corners = me._createCornerConfig();

        const arrowPosition = me._getArrowPosition(Enums.Corner.BOTTOM_RIGHT);
        me._arrow = scene.add.image(arrowPosition.pos.x, arrowPosition.pos.y, 'arrow')
            .setAngle(arrowPosition.angle)
            .setDepth(Consts.Depth.Max);
    }

    /**
     * @returns {Phaser.Geom.Rectangle}
     */
    getBounds() {
        const me = this;

        return new Phaser.Geom.Rectangle(
            me._position.x,
            me._position.y,
            me._side,
            me._side
        );
    }

    /**
     * @param {Number} player 
     * @param {Number} index 
     * @param {Boolean} isCycle
     * @return {Cell}
     */
    getCell(player, index, isCycle) {
        const me = this;

        const corner = me._getCornerIndex(player);
        const fields = me._getFieldsFrom(corner);
        return me._fieldToCell(player, index, fields, !!isCycle);
    }

    getHome(player) {
        const me = this;

        const circle = me.getCircleLength();
        return me.getPath(player, circle, circle + me._size / 2 - 1);
    }

    /**
     * @param {Number} player 
     * @param {Number} from 
     * @returns {Cell[]}
     */
    getPath(player, from, to, isCycle) {
        const me = this;

        const corner = me._getCornerIndex(player);
        const fields = me._getFieldsFrom(corner);
        const cells = fields.map((f, i) => me._fieldToCell(player, i, fields, !!isCycle));

        const result = [];
        let length = from == 0
                        ? me.getCircleLength()
                        : cells.length;
        if (!!to && !isCycle)
            length = to + 1;

        for (let i = from; i < length; ++i)
            result.push(cells[i]);

        if (isCycle)
            for (let i = 0; i < to + 1; ++i)
                result.push(cells[i]);

        return result;
    }

    getStoragePosition(player) {
        const me = this;

        const corner = me._getCornerIndex(player);
        const offset = Consts.StorageByCorner[corner];

        return Utils.buildPoint(
            me._position.x + me._side * offset.sideX + offset.x,
            me._position.y + me._side * offset.sideY + offset.y
        );
    }

    getBoosterPosition(player) {
        const me = this;

        const corner = me._getCornerIndex(player);
        const offset = Consts.BoosterByCorner[corner];

        return Utils.buildPoint(
            me._position.x + me._side * offset.sideX + offset.x,
            me._position.y + me._side * offset.sideY + offset.y
        );
    }

    findCell(point) {
        const me = this;

        const inside = point.x > me._position.x + Consts.UnitSmall
                       && point.x < me._position.x + me._side - Consts.UnitSmall
                       && point.y > me._position.y + Consts.UnitSmall
                       && point.y < me._position.y + me._side - Consts.UnitSmall;

        if (!inside)
            return new Cell({index: Consts.Undefined});

        const row = Math.floor((point.y - me._position.y - Consts.UnitSmall) / Consts.Unit); 
        const col = Math.floor((point.x - me._position.x - Consts.UnitSmall) / Consts.Unit);
        
        return new Cell({
            row: row,
            col: col
        });
    }

    /**
     * @param {Number} player 
     */
    getSpawn(player) {
        const me = this;

        const corner = me._corners[me._getCornerIndex(player)];
        const position = me._rowColToPoint(corner.row, corner.col);
        return new Cell({
            player: player,
            x: position.x,
            y: position.y,
            row: corner.row,
            col: corner.col,
            index: 0
        });
    }

    getCircleLength() {
        const me = this;

        return (me._size - 1) * 4;
    }

    /**
     * @param {Number} player 
     * @param {Cell} target 
     * @returns {Boolean}
     */
    isOwnCorner(player, target) {
        const me = this;

        const corner = me._corners[me._getCornerIndex(player)];

        return target.isEqualPos(corner);
    }

    moveArrow(player, callback, context) {
        const me = this;
        const corner = me._getCornerIndex(player);
        const nextPosition = me._getArrowPosition(corner);

        me._scene.add.tween({
            targets: me._arrow,
            x: nextPosition.pos.x,
            y: nextPosition.pos.y,
            angle: nextPosition.angle,
            duration: Consts.Speed.ArrowMs,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                if (!!callback)
                    callback.call(context);
            }
        });
    }

    _getArrowPosition(corner) {
        const me = this;

        switch (corner) {
            case Enums.Corner.BOTTOM_RIGHT:
                return {
                    pos: Utils.buildPoint(
                        me._position.x + me._side + 0.5 * Consts.UnitSmall, 
                        me._position.y + me._side + 0.5 * Consts.UnitSmall),
                    angle: 180
                };

            case Enums.Corner.BOTTOM_LEFT:
                return {
                    pos: Utils.buildPoint(
                        me._position.x - 0.5 * Consts.UnitSmall, 
                        me._position.y + me._side + 0.5 * Consts.UnitSmall),
                    angle: -90
                };

            case Enums.Corner.TOP_LEFT:
                return {
                    pos: Utils.buildPoint(
                        me._position.x - 0.5 * Consts.UnitSmall, 
                        me._position.y - 0.5 * Consts.UnitSmall),
                    angle: 0
                };

            case Enums.Corner.TOP_RIGHT:
                return {
                    pos: Utils.buildPoint(
                        me._position.x + me._side + 0.5 * Consts.UnitSmall, 
                        me._position.y - 0.5 * Consts.UnitSmall),
                    angle: 90
                };
            default:
                throw `unknown corner: ${corner}`;
        }
    }

    isCorner(target) {
        const me = this;

        return Utils.any(me._corners, c => target.isEqualPos(c));
    }

    _getCornerIndex(player) {
        const me = this;

        return Consts.PlayerCornerByCount[me._playerCount - 1][player];
    }

    _fieldToCell(player, index, fields, isCycle) {
        const me = this;

        if (isCycle)
            index = index % me.getCircleLength();

        if (index >= fields.length)
            return new Cell({player: player, index: Consts.Undefined});

        const field = fields[index];

        const position = me._rowColToPoint(field.row, field.col);
        return new Cell({
            player: player,
            x: position.x,
            y: position.y,
            row: field.row,
            col: field.col,
            index: index
        });
    }

    _rowColToPoint(row, col) {
        const me = this;

        const offset = 2 * Consts.UnitSmall;
        return Utils.buildPoint(
            me._position.x + offset + col * Consts.Unit,
            me._position.y + offset + row * Consts.Unit);
    }

    /**
     * @param {Number} corner
     * @returns {Object[]}
     */
    _getFieldsFrom(corner) {
        const me = this;

        const start = me._corners[corner];
        let shiftRow = start.shiftRow;
        let shiftCol = start.shiftCol;

        let current = { row: start.row, col: start.col };
        const fields = [ {...current}];
        const circleLength = me.getCircleLength();
        while (fields.length <= circleLength) {
            current.row += shiftRow;
            current.col += shiftCol;
            fields.push({...current});

            const currentCorner = me._getCorner(current.row, current.col);
            if (currentCorner != Enums.Corner.UNKNOWN) {
                shiftRow = me._corners[currentCorner].shiftRow;
                shiftCol = me._corners[currentCorner].shiftCol;
            }
        }

        const nextCorner = (corner + 1) % 4;
        shiftRow = start.shiftRow + me._corners[nextCorner].shiftRow;
        shiftCol = start.shiftCol + me._corners[nextCorner].shiftCol;
        for (let i = 0; i < me._size / 2 - 1; ++i) {
            current.row += shiftRow;
            current.col += shiftCol;
            fields.push({...current});
        }

        return fields;
    }

    _getCorner(row, col) {
        const me = this;

        if (row == 0 && col == 0)
            return Enums.Corner.TOP_LEFT;
        if (row == 0 && col == me._size - 1)
            return Enums.Corner.TOP_RIGHT;
        if (row == me._size - 1 && col == me._size - 1)
            return Enums.Corner.BOTTOM_RIGHT;
        if (row == me._size - 1 && col == 0)
            return Enums.Corner.BOTTOM_LEFT;

        return Enums.Corner.UNKNOWN;
    }

    _buildTileArray(size) {
        const me = this;

        const level = [];

        const topBorder = [ 10 ].concat(Utils.buildArray(size * 2, 8)).concat(11);

        level.push(topBorder);

        for (let i = 0; i < size; ++i)
        {
            const firstRow = [];
            firstRow.push(9);
            for (let j = 0; j < size; ++j) {
                const color = (i + j) % 2 === 0 ? 2 : 0;
                firstRow.push(color);
                firstRow.push(color + 1);
            }
            firstRow.push(9);

            level.push(firstRow);


            const secondRow = [];
            secondRow.push(9);
            for (let j = 0; j < size; ++j) {
                const color = (i + j) % 2 === 0 ? 2 : 0;
                secondRow.push(4 + color);
                secondRow.push(4 + color + 1);
            }
            secondRow.push(9);

            level.push(secondRow);
        }

        const bottomBorder = [ 12 ].concat(Utils.buildArray(size * 2, 8)).concat(13);
        level.push(bottomBorder);

        return level;       
    }

    _createCornerConfig() {
        const me = this;
        return [
            {
                row: 0,
                col: 0,
                shiftRow: 0,
                shiftCol: 1
            },
            {
                row: 0,
                col: me._size - 1,
                shiftRow: 1,
                shiftCol: 0
            },
            {
                row: me._size - 1,
                col: me._size - 1,
                shiftRow: 0,
                shiftCol: -1
            },
            {
                row: me._size - 1,
                col: 0,
                shiftRow: -1,
                shiftCol: 0
            }
        ];
    }
}