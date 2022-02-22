import Phaser from '../lib/phaser.js';

import Config from '../game/Config.js';
import Consts from '../game/Consts.js';
import Core from '../game/Core.js';

export default class Game extends Phaser.Scene {

    /** @type {Phaser.GameObjects.Text} */
    _logger;

	/** @type {Core} */
	_core;

    constructor() {
        super('game');
    }

    preload() {
        const me = this;

        me.load.tilemapCSV('level', 'assets/level.csv');

        me.load.spritesheet('tiles', 'assets/tiles.png', {
            frameWidth: Consts.Unit.Small,
            frameHeight: Consts.Unit.Small
        });

        me.load.spritesheet('sprites', 'assets/sprites.png', {
            frameWidth: Consts.Unit.Default,
            frameHeight: Consts.Unit.Default,
        })
    }

    create() {
        const me = this;

        me._core = new Core(me);

        if (Config.Debug) {
            me._logger = me.add.text(10, 10, 'DEBUG', { fontSize: 14, backgroundColor: '#000' })
                .setScrollFactor(0)
                .setDepth(Consts.Depth.Max);
        }
    }

    update() {
        const me = this;

        me._core.update();

        if (Config.Debug) {
            me._logger.text = 
                `mse: ${me.input.activePointer.worldX} ${me.input.activePointer.worldY}\n` +
                `plr: ${me._core._player.getPosition().x.toFixed(0)} ${me._core._player.getPosition().y.toFixed(0)}`;
        }
    }
}