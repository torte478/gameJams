import Phaser from '../../lib/phaser.js';

import Consts from '../Consts.js';
import Utils from '../Utils.js';

export default class Board {

    /** @type {Phaser.Geom.Point} */
    _position;

    /** @type {Number} */
    _size;

    /** @type {Number} */
    _side;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Number} size 
     */
    constructor(scene, size) {
        const me = this;

        me._size = size;
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

    _buildTileArray(size) {
        const me = this;

        const border = 2;
        const white = 0;
        const black = 1;

        const level = [];

        const borderRow = Utils.buildArray(size * 2 + 2, border);

        level.push(borderRow);

        for (let i = 0; i < size; ++i)
        {
            const row = [];
            row.push(border);
            for (let j = 0; j < size; ++j) {
                const color = (i + j) % 2 === 0 ? white : black;
                row.push(color);
                row.push(color);
            }
            row.push(border);

            level.push(row);
            level.push(row);
        }

        level.push(borderRow);

        return level;       
    }
}