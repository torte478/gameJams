import Phaser from '../lib/phaser.js';

import Consts from './Consts.js';
import Enums from './Enums.js';

export default class LevelMap {

    /** @type {Phaser.Tilemaps.Tilemap} */
    _level;

    /** @type {Phaser.Tilemaps.TilemapLayer} */
    _tiles;

    constructor(scene) {
        const me = this;

        me._level = scene.make.tilemap({
            key: 'level',
            tileWidth: Consts.Unit.Small,
            tileHeight: Consts.Unit.Small
        });

        const tileset = me._level.addTilesetImage('tiles');

        me._level.setCollisionBetween(200, 399);

        me._tiles = me._level.createLayer(0, tileset)
            .setDepth(Consts.Depth.Tiles);

        scene.add.image(
            Consts.Viewport.Width / 2, 
            Enums.Layer.PAST * Consts.Viewport.Height + Consts.Viewport.Height / 2,
            'sky_past')
            .setDepth(Consts.Depth.Background);
        scene.add.image(
            Consts.Viewport.Width / 2, 
            Enums.Layer.PRESENT * Consts.Viewport.Height + Consts.Viewport.Height / 2,
            'sky_present')
            .setDepth(Consts.Depth.Background);
        scene.add.image(
            Consts.Viewport.Width / 2, 
            Enums.Layer.FUTURE * Consts.Viewport.Height + Consts.Viewport.Height / 2,
            'sky_future')
            .setDepth(Consts.Depth.Background);
    }

    getCollider() {
        const me = this;

        return me._tiles;
    }

    isFree(rect) {
        const me = this;

        const x = Math.floor(rect.x / Consts.Unit.Small);
        const y = Math.floor(rect.y / Consts.Unit.Small);

        const widthMod = rect.x % Consts.Unit.Small > 4 ? 1 : 0;
        const heghtMod = rect.y % Consts.Unit.Small > 4 ? 1 : 0;

        const width = Math.floor(rect.width / Consts.Unit.Small) + widthMod;
        const height = Math.floor(rect.height / Consts.Unit.Small) + heghtMod;

        const tiles = me._level.findTile(() => true, this, x, y, width, height, { 
            isColliding: true });

        return !tiles;
    }

    getSolidTiles(from, distance, layer, nextLayer) {
        const me = this;
        const res = [];

        const fromY = nextLayer * Consts.Viewport.Height + from.y % Consts.Viewport.Height;

        me._level.forEachTile(
            (tile) => {    
                const tileX = tile.getCenterX();
                const tileY = tile.getCenterY();
                
                const dist = Phaser.Math.Distance.Between(from.x, fromY, tileX, tileY);
            
                if (dist <= distance && tile.canCollide) {  // TODO : remove can Collide
                    const y = layer * Consts.Viewport.Height + tileY % Consts.Viewport.Height;
                    res.push({ x: tileX, y: y, index: tile.idnex});
                }
            },
            me,
            0,
            nextLayer * (Consts.Viewport.Height / Consts.Unit.Small),
            Consts.Viewport.Width / Consts.Unit.Small,
            Consts.Viewport.Height / Consts.Unit.Small,
            { isColliding: true });

        return res;
    }
}