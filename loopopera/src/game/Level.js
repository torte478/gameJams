import Here from "../framework/Here.js";
import Consts from "./Consts.js";

export default class Level {

    /** @type {Phaser.Tilemaps.TilemapLayer} */
    _tiles;

    constructor() {
        const me = this;

        const level = Here._.make.tilemap({
            key: 'level',
            tileWidth: Consts.Unit.Normal,
            tileHeight: Consts.Unit.Normal
        });
        const tileset = level.addTilesetImage('tiles');
        me._tiles = level.createLayer(0, tileset)
            .setDepth(Consts.Depth.Tiles);

        level.setCollision([
            0, 1, 
            21, 22, 23, 25, 26, 27,
            31, 32, 33, 35, 36, 37,
            41, 42, 43, 45, 46, 47,
        ]); 
    }

    /**
     * @returns {Phaser.Tilemaps.TilemapLayer}
     */
    getCollider() {
        const me = this;

        return me._tiles;
    }

    setTile(x, y, tileIndex) {
        const me = this;

        me._tiles.fill(tileIndex, x, y, 1, 1);
    }
}