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

        me._loadImage('fade');
        me._loadImage('sprites_small');

        me._loadSpriteSheet('tiles', Consts.Unit.Small);
        me._loadSpriteSheet('sprites', Consts.Unit.Default);
        me._loadSpriteSheet('player', Consts.Unit.Default);
    }

    create() {
        const me = this;

        me._createAnimation();

        me._core = new Core(me, 0);

        if (Config.Debug) {
            me._logger = me.add.text(10, 10, 'DEBUG', { fontSize: 14, backgroundColor: '#000' })
                .setScrollFactor(0)
                .setDepth(Consts.Depth.Max);
            
            if (Config.DebugCameras) {
                me._core._debugCameras[0].ignore(me._logger);
                me._core._debugCameras[1].ignore(me._logger);
            }
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

    _loadSpriteSheet(name, width, height) {
        const me = this;

        return me.load.spritesheet(name, `assets/${name}.png`, {
            frameWidth: width,
            frameHeight: !!height ? height : width
        });
    }

    _loadImage(name) {
        const me = this;

        return me.load.image(name, `assets/${name}.png`);
    }

    _createAnimation() {
        const me = this;

        me.anims.create({
            key: 'player_idle',
            frames: me.anims.generateFrameNames('player', { frames: [ 0, 1 ]}),
            frameRate: 2,
            repeat: -1
        });

        me.anims.create({
            key: 'player_run',
            frames: me.anims.generateFrameNames('player', { frames: [ 4, 5, 6, 5 ]}),
            frameRate: 6,
            repeat: -1
        });

        me.anims.create({
            key: 'player_jump',
            frames: me.anims.generateFrameNames('player', { frames: [ 3 ]}),
            frameRate: 1,
            repeat: -1
        });
    }
}