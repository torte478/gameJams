import Phaser from '../../lib/phaser.js';
import Consts from '../Consts.js';
import Utils from '../Utils.js';

export default class Board {

    /**
     * @param {Phaser.Scene} scene 
     * @param {Number} size 
     */
    constructor(scene, size) {
        const me = this;

        const array = me._buildTileArray(size);
        const position = me._getPosition(size);

        const map = scene.make.tilemap({ 
            data: array, 
            tileWidth: Consts.UnitHalf, 
            tileHeight: Consts.UnitHalf });
        const tiles = map.addTilesetImage('board');
        const layer = map.createLayer(0, tiles, position.x, position.y);
    }

    _getPosition(size) {
        const me = this;

        const side = (size * 2 + 2) * Consts.UnitHalf;

        return Utils.buildPoint(
            (Consts.Viewport.Width - side) / 2,
            (Consts.Viewport.Height - side) / 2,
        )
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