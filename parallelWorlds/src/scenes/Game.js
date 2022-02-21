import Phaser from '../lib/phaser.js';

import Consts from '../game/Consts.js';
import Core from '../game/Core.js';

export default class Game extends Phaser.Scene {

	/** @type {Core} */
	_core;

    constructor() {
        super('game');
    }

    preload() {
        const me = this;

        me.load.tilemapCSV('level', 'assets/level.csv');
        me.load.spritesheet('tiles', 'assets/tiles.png', {
            frameWidth: Consts.Unit,
            frameHeight: Consts.Unit
        });
    }

    create() {
        const me = this;

        me.cameras.main.setScroll(0, Consts.Viewport.Height);

        const level = me.make.tilemap({
            key: 'level',
            tileWidth: Consts.Unit,
            tileHeight: Consts.Unit
        });

        const image = level.addTilesetImage('tiles');
        const layer = level.createLayer(0, image)
            .setDepth(Consts.Depth.Tiles);

        //level.setCollisionBetween(1, 3);

        me._core = new Core(me.add);
    }

    update() {
        const me = this;
    }
}