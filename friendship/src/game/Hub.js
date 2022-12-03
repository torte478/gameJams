import Phaser from '../lib/phaser.js';
import Config from './Config.js';
import Consts from './Consts.js';
import Player from './Player.js';

export default class Hub {

    /** @type {Phaser.Scene} */
    _scene;

    /** @type {Phaser.Tilemaps.TilemapLayer} */
    _tiles;

    /** @type {Phaser.Geom.Point} */
    _pos;

    /** @type {Phaser.Geom.Rectangle} */
    _originBounds;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Phaser.Geom.Rectangle} originBounds
     */
    constructor(scene, originBounds) {
        const me = this;

        me._scene = scene;
        me._originBounds = originBounds;

        const tilemap  = scene.make.tilemap({
            tileWidth: Consts.Unit,
            tileHeight: Consts.Unit,
            data: [
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
                [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            ]
        });
        me._pos = Config.Hub.Pos;
        const tileset = tilemap.addTilesetImage('tilemap');
        me._tiles = tilemap.createLayer(0, tileset, me._pos.x, me._pos.y)
            .setDepth(Consts.Depth.Tiles);

        for (let i = 0; i < Consts.CollideTiles.length; ++i) {
            const tileIndex = Consts.CollideTiles[i];
            tilemap.setCollision(tileIndex);
        }

        scene.add.image(me._pos.x + 400, me._pos.y + 200, 'hub')
            .setDepth(Consts.Depth.Background);
    }

    getTiles() {
        const me = this;

        return me._tiles;
    }

    /**
     * @param {Player} player 
     */
    enter(player) {
        const me = this;

        me._scene.cameras.main.setBounds(me._pos.x - 100, me._pos.y - 200, 1000, 800);
        player.toGameObject().setPosition(me._pos.x + 200, me._pos.y + 290);

        player.startCharge();
    }

    /**
     * @param {Player} player 
     */
    exit(player) {
        const me = this;

        me._scene.cameras.main.setBounds(
            me._originBounds.x, 
            me._originBounds.y, 
            me._originBounds.width, 
            me._originBounds.height);

        player.toGameObject().setPosition(
            Config.Start.HubEnterTrigger.x + 100,
            Config.Start.HubEnterTrigger.y + 150);

        player.stopCharge();
    }
}