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

export default class Game extends Phaser.Scene {

    /** @type {Boolean} */
    debug = true;

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
        'guard': false
    };

    /** @type {Array} */
    guards;

    invisibleWalls = {
        /** @type {Phaser.GameObjects.Zone} */
        guard: null
    }

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

            // for (let i = 0; i < Consts.arrowCountY; ++i)
            // for (let j = 0; j < Consts.arrowCountX; ++j) {
            //     const name = `arrows_${i}_${j}`;
            //     me.load.image(name, `assets/${name}.png`);
            // }
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
        me.load.image('king', 'assets/king.png');
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
    }

    create() {
        const me = this;

        me.clock = new Clock(me);

        if (Consts.renderClock) {
            me.clock.addTiles(
                Consts.backgroundCount, 
                Consts.backgroundCount,
                Consts.backgroundSize, 
                'bg',
                0);

            // me.clock.addTiles(
            //     Consts.arrowCountX,
            //     Consts.arrowCountY,
            //     Consts.backgroundSize,
            //     'arrows',
            //     1000);
        }

        me.keyboard = new Keyboard(me.input.keyboard);
        me.keyboard.emitter.on('keyDown', me.onKeyDown, me);

        const city = me.createTilemap('main_tilemap_map', Consts.cityStartY);
        city.setDepth(-100);
        const secret = me.createTilemap('secret_tilemap_map', Consts.secretStartY);
        const desert = me.createTilemap('desert_tilemap_map', Consts.desertStartY);

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

        me.add.image(0, -1152, 'king');

        me.anims.create({
            key: 'saler',
            frames: 'saler',
            frameRate: 3,
            repeat: -1,
        });

        me.add.sprite(Consts.carrotSalerPos.x, Consts.carrotSalerPos.y, 'saler').play('saler');

        me.add.sprite(0, -8704, 'desert_drawing');

        me.player = new Player(
            me,
            Consts.playerSpawn,
            me.add.sprite(0, 0, 'player'),
            me.add.sprite(0, 0, 'player_hands', 0),
            me.keyboard);

        me.timeline = new Timeline(Consts.duration, Consts.startTime);

        me.cameraViews = new CameraViews(me, Consts.enableSecondCamera);

        me.floorItems = me.add.group();
        me.tips = me.add.group();

        me.physics.add.collider(me.player.container, city);
        me.physics.add.collider(me.player.container, desert);

        me.physics.add.collider(me.player.container, me.invisibleWalls.guard);

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
                Consts.guardPos.x + 40,
                Consts.guardPos.y,
                Consts.unit * 7,
                Consts.unit * 2),
            Consts.guardPos.x + 16,
            Consts.guardPos.y - 55,
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
                    bounds.height + (console.secretStartY - bounds.y));
            },
            null,
            me)

        me.add.sprite(288, -5690, 'roof');
        me.add.sprite(-288, -5690, 'roof');

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

        if (me.timeline.current >= Consts.gameOverTime) {
            me.scene.start('game_over');
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
                me.player.donkey = !me.player.donkey;
            }

            if (key === '2') {
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
            me.player.takeFromFloor(item.frame.name)
            me.floorItems.killAndHide(item);
        }
        else {
            const carrot = me.field.checkCarrot(me.player.container.x, me.player.container.y);
            if (!!carrot) {
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

            if (dist < Consts.unit * 2) {
                me.player.take(Consts.playerHandState.EMPTY);
                me.putItemToGround(
                    Consts.carrotSalerPos.x + 64, 
                    Consts.carrotSalerPos.y + 16, 
                    Consts.itemsFrame.MONEY);

                return;
            } 
        } else if (me.player.handsFrame === Consts.playerHandState.MONEY) {
            const dist = Phaser.Math.Distance.Between(
                Consts.guardPos.x,
                Consts.guardPos.y,
                me.player.container.x,
                me.player.container.y);

            if (dist < Consts.unit * 2 && me.invisibleWalls.guard.active) {
                me.player.take(Consts.playerHandState.EMPTY);
                
                me.guards.forEach(x => {
                    /** @type {Phaser.GameObjects.Sprite} */
                    const guard = x;
                    guard.play('guard_open');
                })

                me.invisibleWalls.guard.destroy();
                me.tipsConfig['guard'] = true;

                return;
            }
        }

        // TODO : to switch
        const itemFrame = me.player.handsFrame === Consts.playerHandState.CARROT
            ? Consts.itemsFrame.CARROT
            : Consts.itemsFrame.MONEY;
        
        me.putItemToGround(me.player.container.x, me.player.container.y, itemFrame);
        me.player.take(Consts.playerHandState.EMPTY);
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