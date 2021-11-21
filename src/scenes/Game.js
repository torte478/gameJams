import Phaser from '../lib/phaser.js';

import Actions from '../game/Actions.js';
import Bot from '../game/Bot.js';
import CameraViews from '../game/CameraViews.js';
import Clock from '../game/Clock.js';
import Consts from '../game/Consts.js';
import Field from '../game/Field.js';
import {Rectangle} from '../game/Geometry.js';
import Keyboard from '../game/Keyboard.js';
import Player from '../game/Player.js';
import Timeline from '../game/Timeline.js';
import Trigger from '../game/Trigger.js';

export default class Game extends Phaser.Scene {

    /** @type {Boolean} */
    debug = false;

    /** @type {Player} */
    player;

    /** @type {Keyboard} */
    keyboard;

    /** @type {Phaser.GameObjects.Text} */
    log;

    /** @type {Timeline} */
    timeline;

    /** @type {CameraViews} */
    cameraViews;

    /** @type {Clock} */
    clock;

    /** @type {Array} */
    bots;

    /** @type {Field} */
    field;

    /** @type {Phaser.GameObjects.Group} */
    floorItems;

    /** @type {Phaser.GameObjects.Group} */
    tips;

    tipsConfig = {
        'carrotSaleman': false,
        'guard': false,
        'icecreamSaleman': false
    };

    /** @type {Array} */
    guards;

    invisibleWalls = {
        /** @type {Phaser.GameObjects.Zone} */
        guard: null
    }

    /** @type {Phaser.GameObjects.Sprite} */
    king;

    playerOnSecretPlace = false;

    constructor() {
        super('game');
    }

    preload() {
        const me = this;

        if (Consts.renderClock) {
            for (let i = 0; i < Consts.backgroundCount; ++i) 
            for (let j = 0; j < Consts.backgroundCount; ++j) {
                const name = `bg_${i}_${j}`;
                me.load.image(name, `assets/background/${name}.png`);
            }
        }
        if (Consts.renderArrows) {
            for (let i = 0; i < Consts.arrowCountY; ++i)
            for (let j = 0; j < Consts.arrowCountX; ++j) {
                const name = `arrows_${i}_${j}`;
                me.load.image(name, `assets/${name}.png`);
            }
        }

        //TODO: to helper methods
        me.load.spritesheet('player', 'assets/player.png', {
            frameWidth: 64,
            frameHeight: 64
        });

        me.load.spritesheet('player_hands', 'assets/player_hands.png', {
            frameWidth: 64,
            frameHeight: 64
        });

        me.load.tilemapCSV('main_tilemap_map', 'assets/main_tilemap.csv');
        me.load.tilemapCSV('secret_tilemap_map', 'assets/secret_tilemap.csv');
        me.load.tilemapCSV('desert_tilemap_map', 'assets/desert_tilemap.csv');
        me.load.image('main_tilemap', 'assets/main_tilemap.png');

        me.load.spritesheet('bot_cit_0', 'assets/bot_cit_0.png', {
            frameWidth: 64,
            frameHeight: 64
        });

        me.load.spritesheet('guard', 'assets/guard.png', {
            frameWidth: 128,
            frameHeight: 64
        });
        me.load.spritesheet('king', 'assets/king.png', {
            frameWidth: 64,
            frameHeight: 64,
        });
        me.load.spritesheet('saler', 'assets/saler.png', {
            frameWidth: 64,
            frameHeight: 64
        });

        me.load.spritesheet('items', 'assets/items.png', {
            frameWidth: 64,
            frameHeight: 64
        });

        me.load.image('roof', 'assets/roof.png');
        me.load.image('desert_drawing', 'assets/desert_drawing.png');
        me.load.audio('main_theme', 'assets/sfx/main_theme.mp3');
        me.load.audio('sfx', 'assets/sfx/sfx.wav');
        me.load.image('roof_donkey', 'assets/roof_donkey.png');
        me.load.audio('tick', 'assets/sfx/tick.mp3');
        me.load.audio('earthquake', 'assets/sfx/earthquake.wav');
        me.load.image('castle_door', 'assets/castle_door.png');
        me.load.image('castle_drawing', 'assets/castle_drawing.png');

        me.load.spritesheet('details', 'assets/details.png', {
            frameWidth: 256,
            frameHeight: 128
        });

        me.load.spritesheet('lightning', 'assets/lightning.png', {
            frameWidth: 128,
            frameHeight: 64
        });

        me.load.audio('lightning', 'assets/sfx/lightning.mp3');
        me.load.image('wall', 'assets/wall.png');
    }

    create() {
        const me = this;

        me.playerOnSecretPlace = false;
        me.tipsConfig = {
            'carrotSaleman': false,
            'guard': false,
            'icecreamSaleman': false
        };

        me.clock = new Clock(me);

        if (Consts.renderClock) {
            me.clock.addTiles(
                Consts.backgroundCount, 
                Consts.backgroundCount,
                Consts.backgroundSize, 
                'bg',
                -1000);
        }

        if (Consts.renderArrows) {
            me.clock.addTiles(
                Consts.arrowCountX,
                Consts.arrowCountY,
                8000,
                'arrows',
                1000);
        }

        me.keyboard = new Keyboard(me.input.keyboard);
        me.keyboard.emitter.on('keyDown', me.onKeyDown, me);

        const city = me.createTilemap('main_tilemap_map', Consts.cityStartY).setDepth(-100);
        const secret = me.createTilemap('secret_tilemap_map', Consts.secretStartY).setDepth(-100);
        const desert = me.createTilemap('desert_tilemap_map', Consts.desertStartY).setDepth(-100);

        me.field = new Field(me);

        me.anims.create({
            key: 'bot_cit_0_walk',
            frames: me.anims.generateFrameNumbers('bot_cit_0', { frames: [ 0, 1, 2, 3 ] }),
            frameRate: 4,
            repeat: -1,
        });

        me.anims.create({
            key: 'bot_cit_0_dance',
            frames: me.anims.generateFrameNumbers('bot_cit_0', { frames: [4, 5, 6, 7, 8, 9, 10, 11, 12, 13 ] }),
            frameRate: 8,
            repeat: -1,
        });

        me.bots = 
        [
            new Bot(
                me, 
                'bot_cit_0',   
                [
                    { x: -288, y: -4618},
                    { action: Actions.DANCE },
                    { x: 288, y: -4618},
                    { action: Actions.DANCE },
                    { x: 0, y: -4618},
                    { x: 0, y: -5034},
                    { x: -288, y: -5034},
                    { action: Actions.DANCE },
                    { x: 288, y: -5034},
                    { action: Actions.DANCE },
                    { x: 0, y: -5034},
                    { x: 0, y: -4618}
                ]),

            new Bot(
                me, 
                'bot_cit_0',   
                [
                    { x: 0, y: -5455},
                    { x: 0, y: -4228},
                    { action: Actions.DANCE },
                    { x: 256, y: -4228},
                    { x: 256, y: -2986},
                    { action: Actions.DANCE },
                    { x: 256, y: -4228},
                    { x: 0, y: -4228},
                ]),

                new Bot(
                    me, 
                    'bot_cit_0',   
                    [
                        { x: -288, y: -2975},
                        { action: Actions.DANCE },
                        { x: -288, y: -2559},
                        { action: Actions.DANCE },
                        { x: 288, y: -2559},
                        { action: Actions.DANCE },
                        { x: 288, y: -2975},
                        { action: Actions.DANCE }
                    ])
        ]

        me.anims.create({
            key: 'guard_open',
            frames: 'guard',
            frameRate: 8,
            repeat: 0
        })

        me.guards = [
            me.add.sprite(Consts.guardPos.x, Consts.guardPos.y, 'guard', 0),
            me.add.sprite(-Consts.guardPos.x, Consts.guardPos.y, 'guard', 0).setFlipX(true)
        ];

        me.invisibleWalls.guard = me.add.zone(
            0,
            -5728,
            Consts.unit * 4,
            Consts.unit * 2);
        me.physics.world.enable(me.invisibleWalls.guard, Phaser.Physics.Arcade.STATIC_BODY);

        me.king = me.add.sprite(Consts.kingPos.x, Consts.kingPos.y, 'king', 0);
        me.king.moving = false;
        me.king.icecream = false;

        me.anims.create({
            key: 'king_walk',
            frames: me.anims.generateFrameNumbers('king', { frames: [ 0, 1, 2, 1 ] }),
            frameRate: 4,
            repeat: -1,
        });

        me.anims.create({
            key: 'king_icecream',
            frames: me.anims.generateFrameNumbers('king', { frames: [ 3, 4 ] }),
            frameRate: 2,
            repeat: -1,
        });

        me.anims.create({
            key: 'saler',
            frames: 'saler',
            frameRate: 3,
            repeat: -1,
        });

        me.add.sprite(Consts.carrotSalerPos.x, Consts.carrotSalerPos.y, 'saler').play('saler');
        me.add.sprite(Consts.icecreamSalerPos.x, Consts.icecreamSalerPos.y, 'saler').play('saler');

        me.add.sprite(0, -8704, 'desert_drawing');
        me.add.sprite(-320, -4860, 'items', 5);
        me.add.sprite(-132, -4860, 'items', 6);

        me.add.sprite(-256, -672, 'castle_drawing');

        me.timeline = new Timeline(Consts.duration, Consts.times.start);

        me.floorItems = me.add.group();
        me.tips = me.add.group();

        me.putItemToGround(288, -2229, Consts.itemsFrame.DONKEY);
        me.putItemToGround(288, -2368, Consts.itemsFrame.KEY);

        me.anims.create({
            key: 'details',
            frames: me.anims.generateFrameNumbers('details', { frames: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ] }),
            frameRate: 12,
            repeat: -1,
        });
        const details = me.add.sprite(0, -472, 'details');
        details.play('details');

        me.add.sprite(256, -480, 'items', 7);

        me.player = new Player(
            me,
            Consts.playerSpawn,
            me.add.sprite(0, 0, 'player'),
            me.add.sprite(0, 0, 'player_hands', 0),
            me.keyboard);

        me.cameraViews = new CameraViews(me, Consts.enableSecondCamera);

        me.physics.add.collider(me.player.container, city);
        me.physics.add.collider(me.player.container, desert);
        me.physics.add.collider(me.player.container, secret);

        me.physics.add.collider(me.player.container, me.invisibleWalls.guard);
        me.physics.world.enable(details, Phaser.Physics.Arcade.STATIC_BODY);
        me.physics.add.collider(me.player.container, details);

        me.castleDoor = me.add.sprite(288, -896, 'castle_door');
        me.physics.world.enable(me.castleDoor, Phaser.Physics.Arcade.STATIC_BODY);
        me.physics.add.collider(me.player.container, me.castleDoor);

        me.createTip(
            me.add.zone(
                Consts.carrotSalerPos.x,
                Consts.carrotSalerPos.y,
                Consts.unit * 2,
                Consts.unit * 2),
            Consts.carrotSalerPos.x + Consts.unit,
            Consts.carrotSalerPos.y - Consts.unit,
            8, // TODO
            'carrotSaleman');

        me.createTip(
            me.add.zone(
                Consts.icecreamSalerPos.x,
                Consts.icecreamSalerPos.y,
                Consts.unit * 2,
                Consts.unit * 2),
            Consts.icecreamSalerPos.x + Consts.unit,
            Consts.icecreamSalerPos.y - Consts.unit,
            9, // TODO
            'icecreamSaleman');

        me.createTip(
            me.add.zone(
                Consts.guardPos.x + 40,
                Consts.guardPos.y,
                Consts.unit * 7,
                Consts.unit * 2),
            Consts.guardPos.x + 16,
            Consts.guardPos.y - 30,
            9, // TODO
            'guard',
            () => me.invisibleWalls.guard.active === false);


        const cameraTrigger = me.add.zone(128, Consts.cityStartY - 32, 512, 64);
        me.physics.world.enable(cameraTrigger);
        me.physics.add.overlap(me.player.container, cameraTrigger,  function() {
            cameraTrigger.destroy();

            const camera = me.cameraViews.main;
            const bounds = camera.getBounds();
            camera.setBounds(
                bounds.x, 
                Consts.secretStartY, 
                bounds.width,
                bounds.height - (Consts.secretStartY - bounds.y));
            },
            null,
            me);

        const kingCameraTrigger = me.add.zone(288, -842, 64, 64);
        me.physics.world.enable(kingCameraTrigger);
        me.physics.add.overlap(me.player.container, kingCameraTrigger,  function() {
            kingCameraTrigger.destroy();

            const camera = me.cameraViews.main;
            const bounds = camera.getBounds();
            camera.setBounds(
                bounds.x, 
                bounds.y, 
                bounds.width,
                bounds.height + 450);
            },
            null,
            me);

        me.add.sprite(288, -5690, 'roof');
        me.add.sprite(-288, -5690, 'roof');

        const roof = me.add.sprite(224, -2320, 'roof_donkey');
        new Trigger(
            me,
            { x: 180, y: -2218, width: 64, height: 64 },
            { x: 64, y: -2218, width: 64, height: 64 },
            function() {
                roof.setVisible(false);
            },
            function() {
                roof.setVisible(true);
            }
        )


        me.tick = me.sound.add('tick');
        if (Consts.playTheme) {
            me.sound.play('main_theme', { volume: 0.5 });
            me.tick.play();
        }

        const z1 = me.add.zone(-384-32, -13984, 64, 600);
        me.physics.world.enable(z1, Phaser.Physics.Arcade.STATIC_BODY);
        me.physics.add.collider(me.player.container, z1);

        const z2 = me.add.zone(384+32, -13984, 64, 600);
        me.physics.world.enable(z2, Phaser.Physics.Arcade.STATIC_BODY);
        me.physics.add.collider(me.player.container, z2);

        const z3 = me.add.zone(0, -14600 - 64, 128, 64);
        me.physics.world.enable(z3, Phaser.Physics.Arcade.STATIC_BODY);
        me.physics.add.collider(me.player.container, z3);

        const z4 = me.add.zone(0, -375, 1024, 64);
        me.physics.world.enable(z4, Phaser.Physics.Arcade.STATIC_BODY);
        me.physics.add.collider(me.player.container, z4);

        if (me.debug) {
            me.log = me.add.text(10, 10, 'Debug', {
                fontSize: 14
            })
                .setScrollFactor(0);
        }
    }

    update() {
        const me = this;

        me.timeline.update();
        me.player.update();
        me.keyboard.update();
        me.clock.update(
            me.timeline.current,
            me.convertMainCameraToRectangle());

        me.bots.forEach((bot) => bot.update());

        const up = -3000;
        const down = -600;
        const total = -(up - down)
        const volume = me.player.container.y < up
            ? 0
            : me.player.container.y > down
                ? 1
                : (total + me.player.container.y - down) / total;
        me.tick.volume = 0.5 * volume;

        const time = me.timeline.current;

        if (time >= Consts.times.gameEnd) {
            me.sound.stopAll();
            me.scene.start('game_over', me.playerOnSecretPlace ? 'secret' : '');
        }

        if (time >= Consts.times.startFade) {
            if (!me.cameraViews.fade && !me.playerOnSecretPlace) {
                me.cameraViews.fade = true;
                me.cameraViews.main.fade((Consts.times.stopFade - Consts.times.startFade) * 1000);
            }
        }

        if (time >= Consts.times.startShaking) {
            if (!me.cameraViews.shake) {
                me.cameraViews.main.stopFollow();
                me.cameraViews.main.removeBounds();
                me.cameraViews.shake = true;
                me.cameraViews.beforeShakeX = me.cameraViews.main.scrollX;
                me.cameraViews.beforeShakeY = me.cameraViews.main.scrollY;
                me.sound.play('earthquake');

                if (Phaser.Math.Distance.Between(me.player.container.x, me.player.container.y, 0, -14590) < 32) {
                    me.player.busy = true;
                    me.playerOnSecretPlace = true;
                }
            }

            me.cameraViews.main.scrollX = me.cameraViews.beforeShakeX + Phaser.Math.Between(-5, 5);
            me.cameraViews.main.scrollY = me.cameraViews.beforeShakeY + Phaser.Math.Between(-5, 5);
        }
        
        if (time > Consts.times.king && !me.king.moving && !me.king.icecream) {
            me.king.moving = true;
            me.king.play('king_walk')

            const kingTimeline = me.tweens.createTimeline();
            kingTimeline
                .add({
                    targets: me.king,
                    x: 288,
                    duration: 3000,
                })
                .add({
                    targets: me.king,
                    y: -965,
                    duration: 2000,
                    onComplete: () => { me.castleDoor.setVisible(false)}
                })
                .add({
                    targets: me.king,
                    y: -830,
                    duration: 1500,
                    onComplete: () => { me.castleDoor.setVisible(true)}
                })
                .add({
                    targets: me.king,
                    x: 0,
                    y: -600,
                    duration: 4000,
                })
                .play();
        }

        if (me.debug) {
            me.log.text = 
                `${me.player.container.x | 0} ${me.player.container.y | 0}\n` + 
                `${me.player.container.x / Consts.unit | 0} ${me.player.container.y / Consts.unit | 0}\n` +
                `${(me.player.container.x / Consts.unit | 0) * Consts.unit} ${(me.player.container.y / Consts.unit | 0) * Consts.unit}\n` +
                `time: ${(me.timeline.current).toFixed(1)} (${(me.timeline.remain).toFixed(1)})`;
        }
    }

    convertMainCameraToRectangle() {
        const me = this;
        const camera = me.cameraViews.main;

        return Rectangle.build(
            new Phaser.Geom.Point(
                camera.scrollX - Consts.cameraOffset,
                camera.scrollY - Consts.cameraOffset),
            new Phaser.Geom.Point(
                camera.scrollX + camera.width + Consts.cameraOffset,
                camera.scrollY + camera.height + Consts.cameraOffset)
            );
    }

    /**
     * @param {String} key 
     */
    onKeyDown(key) {
        const me = this;

        // TODO : refactor
        if (key === 'e') {
            if (me.player.handsFrame === Consts.playerHandState.EMPTY) {
                me.checkPlayerTake();   
            } else {
                me.checkPlayerHandsAction();
            }
        }

        if (me.debug) {
            if (key === '1') {
                me.player.take(me.player.handsFrame !== Consts.playerHandState.DONKEY
                    ? Consts.playerHandState.DONKEY
                    : Consts.playerHandState.EMPTY);
            }

            if (key === '2') {
                me.sound.stopAll();
                me.scene.pause();
            }
        }
    }

    /**
     * 
     * @param {String} name 
     * @param {Numer} startY 
     * @returns {Phaser.Tilemaps.TilemapLayer}
     */
    createTilemap(name, startY) {
        const me = this;

        const map = me.make.tilemap({
            key: name,
            tileWidth: Consts.unit,
            tileHeight: Consts.unit
        });

        const image = map.addTilesetImage('main_tilemap');
        const layer = map.createLayer(
            0,
            image,
            Consts.levelStartX,
            startY
        );

        map.setCollisionBetween(1, 7);
        map.setCollisionBetween(9, 10);
        map.setCollisionBetween(12, 13);
        map.setCollisionBetween(17, 18);
        map.setCollisionBetween(28, 29);
        map.setCollisionBetween(31, 31);
        map.setCollisionBetween(39, 39)
        map.setCollisionBetween(36, 37);
        map.setCollisionBetween(61, 61);


        return layer;
    }

    checkPlayerTake() {
        const me = this;

        const items = me.floorItems.getChildren().filter(
            (item) => Phaser.Math.Distance.Between(item.x, item.y, me.player.container.x, me.player.container.y) < Consts.unit);

        if (items.length > 0) {
            const item = items[0];
            me.sound.play('sfx');
            me.player.takeFromFloor(item.frame.name)
            me.floorItems.killAndHide(item);
        }
        else {
            const carrot = me.field.checkCarrot(me.player.container.x, me.player.container.y);
            if (!!carrot) {
                me.sound.play('sfx');
                me.player.container.body.setVelocity(0, 0);
                me.player.startKeepCarrot(carrot.x, carrot.y);
            }
        }
    }

    checkPlayerHandsAction() {
        const me = this;

        // sale carrot
        if (me.player.handsFrame === Consts.playerHandState.CARROT) {
            const dist = Phaser.Math.Distance.Between(
                Consts.carrotSalerPos.x, 
                Consts.carrotSalerPos.y, 
                me.player.container.x, 
                me.player.container.y);

            if (dist < Consts.unit * 4) {
                me.player.take(Consts.playerHandState.EMPTY);
                me.putItemToGround(
                    Consts.carrotSalerPos.x + 64, 
                    Consts.carrotSalerPos.y + 16, 
                    Consts.itemsFrame.MONEY);
                me.sound.play('sfx');

                return;
            } 
        } else if (me.player.handsFrame === Consts.playerHandState.MONEY) {
            let dist = Phaser.Math.Distance.Between(
                Consts.guardPos.x,
                Consts.guardPos.y,
                me.player.container.x,
                me.player.container.y);

            if (dist < Consts.unit * 4 && me.invisibleWalls.guard.active) {
                me.player.take(Consts.playerHandState.EMPTY);
                me.sound.play('sfx');

                me.guards.forEach(x => {
                    /** @type {Phaser.GameObjects.Sprite} */
                    const guard = x;
                    guard.play('guard_open');
                })

                me.invisibleWalls.guard.destroy();
                me.tipsConfig['guard'] = true;

                return;
            }

            dist = Phaser.Math.Distance.Between(
                Consts.icecreamSalerPos.x,
                Consts.icecreamSalerPos.y,
                me.player.container.x,
                me.player.container.y);

            if (dist < Consts.unit * 4) {
                me.player.take(Consts.playerHandState.EMPTY);
                me.putItemToGround(
                    Consts.icecreamSalerPos.x + 64, 
                    Consts.icecreamSalerPos.y + 32, 
                    Consts.itemsFrame.ICECREAM);
                me.sound.play('sfx');

                return;
            } 
        }
        else if (me.player.handsFrame === Consts.playerHandState.ICECREAM) {
            let dist = Phaser.Math.Distance.Between(
                Consts.kingPos.x,
                Consts.kingPos.y,
                me.player.container.x,
                me.player.container.y);

            if (dist < Consts.unit * 4 && !me.king.moving) {
                me.player.take(Consts.playerHandState.EMPTY);
                me.sound.play('sfx');

                me.king.play('king_icecream');
                me.king.icecream = true;

                me.putItemToGround(
                    Consts.kingPos.x + 64,
                    Consts.kingPos.y,
                    Consts.itemsFrame.KEY);

                return;
            }
        }
        else if (me.player.handsFrame === Consts.playerHandState.KEY) {
            let dist = Phaser.Math.Distance.Between(
                me.castleDoor.x,
                me.castleDoor.y,
                me.player.container.x,
                me.player.container.y);

            if (dist < Consts.unit * 4 && !me.king.moving) {
                me.sound.play('sfx');
                me.castleDoor.destroy();
                me.player.take(Consts.playerHandState.EMPTY);

                return;
            }
        }

        let itemFrame;
        switch (me.player.handsFrame) {
            case Consts.playerHandState.CARROT:
                itemFrame = Consts.itemsFrame.CARROT;
                break;
            
            case Consts.playerHandState.MONEY:
                itemFrame = Consts.itemsFrame.MONEY;
                break;
                
            case Consts.playerHandState.DONKEY:
                itemFrame = Consts.itemsFrame.DONKEY;
                break;

            case Consts.playerHandState.ICECREAM:
                itemFrame = Consts.itemsFrame.ICECREAM;
                break;

            case Consts.playerHandState.KEY:
                itemFrame = Consts.itemsFrame.KEY;
                break;
        }
        
        me.putItemToGround(me.player.container.x, me.player.container.y, itemFrame);
        me.player.take(Consts.playerHandState.EMPTY);
        me.sound.play('sfx');
    }
    
    putItemToGround(x, y, frame) {
        const me = this;

        /** @type {Phaser.GameObjects.Sprite} */
        const item = me.floorItems.get(x, y, 'items')

        item
            .setFrame(frame)
            .setActive(true)
            .setVisible(true)
            .setDepth(-10);
    }

    createTip(zone, x, y, frame, key, predicate) {
        const me = this;

        me.physics.world.enable(zone);

        me.physics.add.overlap(
            me.player.container, 
            zone,
            function() {
                if (me.tipsConfig[key] || (!!predicate && predicate())) {
                    return;
                }

                me.tipsConfig[key] = true;
                const tip = me.showTip(x, y, frame);

                me.time.delayedCall(
                    3000, 
                    function() {
                        me.tips.killAndHide(tip); 
                        me.tipsConfig[key] = false;
                    },
                    null,
                    me);
            }, 
            null, 
            me);

        return zone;
    }

    /**
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} frame 
     * @returns {Phaser.GameObjects.Sprite}
     */
    showTip(x, y, frame) {
        const me = this;

        const tip = me.tips.get(x, y, 'items');
        tip
            .setFrame(frame)
            .setDepth(10)
            .setActive(true)
            .setVisible(true);

            return tip;
    }
}