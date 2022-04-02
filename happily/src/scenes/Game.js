import Phaser from '../lib/phaser.js';

import Core from '../game/Core.js';
import Utils from '../game/Utils.js';
import Consts from '../game/Consts.js';

export default class Game extends Phaser.Scene {

	/** @type {Core} */
	_core;

    constructor() {
        super('game');
    }

    preload() {
        const me = this;

        me.load.tilemapCSV('level0', 'assets/level0.csv');

        Utils.loadImage(me, 'background');
        Utils.loadImage(me, 'big_bottle');

        Utils.loadSpriteSheet(me, 'tiles', Consts.Unit.Small);
        Utils.loadSpriteSheet(me, 'player', Consts.Unit.Big);
        Utils.loadSpriteSheet(me, 'she', Consts.Unit.Big);
        Utils.loadSpriteSheet(me, 'wings', 150);
        Utils.loadSpriteSheet(me, 'items', Consts.Unit.Medium);
    }

    create() {
        const me = this;

        me._createAnimation();

        me._core = new Core(me, 0);
    }

    update() {
        const me = this;

        me._core.update();
    }

    _createAnimation() {
        const me = this;

        // player

        me.anims.create({
            key: 'player_idle',
            frames: me.anims.generateFrameNumbers('player', { frames: [ 0, 1 ]}),
            frameRate: 2,
            repeat: -1
        });

        me.anims.create({
            key: 'player_jump',
            frames: me.anims.generateFrameNumbers('player', { frames: [ 2, 3 ]}),
            frameRate: 4,
            repeat: -1
        });

        me.anims.create({
            key: 'player_fly',
            frames: me.anims.generateFrameNumbers('player', { frames: [ 4 ]}),
            frameRate: 1,
            repeat: -1
        });

        me.anims.create({
            key: 'player_walk',
            frames: me.anims.generateFrameNumbers('player', { frames: [ 5, 6, 7, 6]}),
            frameRate: 6,
            repeat: -1
        });

        // she

        me.anims.create({
            key: 'she_idle',
            frames: me.anims.generateFrameNumbers('she', { frames: [ 
                0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 2, 3
            ]}),
            frameRate: 1,
            repeat: -1
        });

        me.anims.create({
            key: 'she_fly_quick',
            frames: me.anims.generateFrameNumbers('she', { frames: [ 4 ] }),
            frameRate: 1,
            repeat: -1
        });

        me.anims.create({
            key: 'she_fly',
            frames: me.anims.generateFrameNumbers('she', { frames: [ 5, 6 ] }),
            frameRate: 2,
            repeat: -1
        });

        me.anims.create({
            key: 'she_fly_player',
            frames: me.anims.generateFrameNumbers('she', { frames: [ 7, 8 ] }),
            frameRate: 4,
            repeat: -1
        });

        me.anims.create({
            key: 'she_fly_player_slow',
            frames: me.anims.generateFrameNumbers('she', { frames: [ 9, 10 ] }),
            frameRate: 8,
            repeat: -1
        });

        // wings

        me.anims.create({
            key: 'wings_close',
            frames: me.anims.generateFrameNumbers('wings', { frames: [ 0, 1, 2, 3, 7] }),
            frameRate: 6,
            repeat: 0
        });

        me.anims.create({
            key: 'wings_fly',
            frames: me.anims.generateFrameNumbers('wings', { frames: [ 4, 5, 6, 5 ] }),
            frameRate: 6,
            repeat: -1
        });

        me.anims.create({
            key: 'wings_fly_quick',
            frames: me.anims.generateFrameNumbers('wings', { frames: [ 4, 5, 6, 5 ] }),
            frameRate: 16,
            repeat: -1
        });

        //other

        me.anims.create({
            key: 'door_open',
            frames: me.anims.generateFrameNumbers('items', { frames: [ 2, 3, 4, 5, 6 ] }),
            frameRate: 10,
            repeat: 0
        });

        me.anims.create({
            key: 'door_close',
            frames: me.anims.generateFrameNumbers('items', { frames: [ 6, 5, 4, 3, 2 ] }),
            frameRate: 10,
            repeat: 0
        });

        me.anims.create({
            key: 'bottle',
            frames: me.anims.generateFrameNumbers('items', { frames: [ 7, 8 ] }),
            frameRate: 5,
            repeat: -1
        });
    }
}