import Phaser from '../lib/phaser.js';

import Core from '../game/Core.js';
import Utils from '../game/Utils.js';
import Consts from '../game/Consts.js';
import Config from '../game/Config.js';

export default class Game extends Phaser.Scene {

	/** @type {Core} */
	_core;

    _levelIndex;

    constructor() {
        super('game');
    }

    init(data) {
        const me = this;

        me._levelIndex = data.level != undefined
            ? data.level
            : 0;

        if (Config.Debug.Global && Config.Debug.LevelIndex)
            me._levelIndex = Config.LevelIndex;
    }

    preload() {
        const me = this;

        const csvName = Config.Levels[me._levelIndex].tiles;

        me.load.tilemapCSV(csvName, `assets/${csvName}.csv`);

        Utils.loadImage(me, 'background');
        Utils.loadImage(me, 'big_bottle');
        Utils.loadImage(me, 'fade');
        Utils.loadImage(me, 'fade_white');

        Utils.loadSpriteSheet(me, 'tiles', Consts.Unit.Small);
        Utils.loadSpriteSheet(me, 'player', Consts.Unit.Big);
        Utils.loadSpriteSheet(me, 'she', Consts.Unit.Big);
        Utils.loadSpriteSheet(me, 'wings', 150);
        Utils.loadSpriteSheet(me, 'items', Consts.Unit.Medium);
        Utils.loadSpriteSheet(me, 'wave', Consts.Unit.Big);
        Utils.loadSpriteSheet(me, 'fire', Consts.Unit.Medium);
        Utils.loadSpriteSheet(me, 'targets', 150, 100);
        Utils.loadSpriteSheet(me, 'buttons', 100);

        me.load.audio('drink', 'assets/sfx/drink.mp3');
        me.load.audio('wings', 'assets/sfx/wings.mp3');
        me.load.audio('wings_quick', 'assets/sfx/wings_quick.mp3');
        me.load.audio('bottle', 'assets/sfx/bottle.wav');
        me.load.audio('button_off', 'assets/sfx/button_off.wav');
        me.load.audio('button_on', 'assets/sfx/button_on.wav');
        me.load.audio('hit', 'assets/sfx/hit.wav');
        me.load.audio('jump', 'assets/sfx/jump.wav');
        me.load.audio('restart', 'assets/sfx/restart.wav');
        me.load.audio('start_fly', 'assets/sfx/start_fly.wav');
        me.load.audio('target', 'assets/sfx/target.wav');
        me.load.audio('idle', 'assets/sfx/idle.mp3');
        me.load.audio('win', 'assets/sfx/win.mp3');
        me.load.audio('death', 'assets/sfx/death.wav');
        me.load.audio('medley', 'assets/sfx/medley.mp3');
        me.load.audio('final', 'assets/sfx/final.mp3');
    }

    create() {
        const me = this;

        me._createAnimation();

        me._core = new Core(me, me._levelIndex);
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

        me.anims.create({
            key: 'player_drink',
            frames: me.anims.generateFrameNumbers('player', { frames: [ 8, 9 ]}),
            frameRate: 4,
            repeat: -1
        });

        me.anims.create({
            key: 'player_death',
            frames: me.anims.generateFrameNumbers('player', { frames: [ 10, 11 ]}),
            frameRate: 8,
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

        me.anims.create({
            key: 'she_death',
            frames: me.anims.generateFrameNumbers('she', { frames: [ 12, 13 ] }),
            frameRate: 8,
            repeat: -1
        });

        me.anims.create({
            key: 'she_kiss',
            frames: me.anims.generateFrameNumbers('she', { frames: [ 0, 14, 15, 16, 15, 0 ] }),
            frameRate: 6,
            repeat: 0
        });

        me.anims.create({
            key: 'she_not_kiss',
            frames: me.anims.generateFrameNumbers('she', { frames: [ 0 ] }),
            frameRate: 3,
            repeat: 0
        });

        me.anims.create({
            key: 'she_cry',
            frames: me.anims.generateFrameNumbers('she', { frames: [ 0, 18, 19, 20, 21, 22 ] }),
            frameRate: 5,
            repeat: 0
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
            key: 'wings_fly_slow',
            frames: me.anims.generateFrameNumbers('wings', { frames: [ 4, 5, 6, 5 ] }),
            frameRate: 1,
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

        me.anims.create({
            key: 'wave',
            frames: me.anims.generateFrameNumbers('wave', { frames: [ 7, 6, 5, 4, 3, 2, 1, 0, 1, 0, 1, 0 ] }),
            frameRate: 30,
            repeat: 0
        });

        me.anims.create({
            key: 'flame_turret',
            frames: me.anims.generateFrameNumbers('items', { frames: [ 10, 11, 12, 11 ] }),
            frameRate: 9,
            repeat: -1
        });

        me.anims.create({
            key: 'fire',
            frameRate: 9,
            repeat: -1
        });

        me.anims.create({
            key: 'targets_iron',
            frames: me.anims.generateFrameNumbers('targets', { frames: [ 0, 1, 2, 3 ] }),
            frameRate: 8,
            repeat: -1
        });

        me.anims.create({
            key: 'targets_kettle',
            frames: me.anims.generateFrameNumbers('targets', { frames: [ 5, 6, 7, 8 ] }),
            frameRate: 8,
            repeat: -1
        });

        me.anims.create({
            key: 'targets_sink',
            frames: me.anims.generateFrameNumbers('targets', { frames: [ 10, 11, 12, 13 ] }),
            frameRate: 8,
            repeat: -1
        });
    }
}