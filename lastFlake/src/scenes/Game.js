import Phaser from '../lib/phaser.js';

import Bot from '../game/Bot.js';
import Consts from '../game/Consts.js';
import Generator from '../game/Generator.js';
import HUD from '../game/HUD.js';
import Player from '../game/Player.js';
import Rules from '../game/Rules.js';
import Snow from '../game/Snow.js';
import Stair from '../game/Stair.js';
import Utils from '../game/Utils.js';

export default class Game extends Phaser.Scene {

    keys = {
        left: null,
        right: null,
        up: null,
        down: null,
        z: null,
        x: null
    }

    /** @type {Player} */
    player;

    /** @type {Phaser.GameObjects.Text} */
    log;

    /** @type {Array} */
    stairs;

    /** @type {Array} */
    toUpdate;

    /** @type {Number} */
    phase;

    /** @type {Snow} */
    snow;

    /** @type {Array} */
    bots;

    /** @type {Phaser.GameObjects.Sprite} */
    key;

    /** @type {Boolean} */
    isMultipleXPress;

    /** @type {Array} */
    generators;

    /** @type {Rules} */
    rules;

    /** @type {Number} */
    initiedLevel;

    /** @type {HUD} */
    hud;

    constructor() {
        super('game');
    }

    init(data) {
        const me = this;

        me.initiedLevel = !!data.level
            ? data.level
            : Consts.startLevel;
    }

    preload() {
        const me = this;

        me.loadImage('background')
        me.loadImage('sky');
        me.loadImage('wall');
        me.loadSpriteSheet('small_arrows', 50);
        me.loadImage('snowflake')
        me.loadSpriteSheet('kids', 100);
        me.loadImage('square');
        me.loadSpriteSheet('key', 100);
        me.loadSpriteSheet('generator', 200);
        me.loadSpriteSheet('garland', 400, 100);
        me.loadSpriteSheet('electricity', 400, 200);
        me.loadImage('thank_text');
        me.loadImage('christmas_text');
        me.loadImage('hud');
        me.loadSpriteSheet('heads', 50);
        me.loadImage('fade');
        me.loadImage('win');
    }

    create() {
        const me = this;

        // graphics

        me.createAnimation();

        me.add.image(Consts.viewSize.width / 2, Consts.viewSize.height / 2, 'sky').setScrollFactor(0);
        me.add.image(Consts.worldSize.width / 2, Consts.worldSize.height / 2, 'background');

        // control

        me.keys.left = me.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        me.keys.right = me.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        me.keys.up = me.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        me.keys.down = me.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        me.keys.z = me.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
        me.keys.x = me.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
        me.isMultipleXPress = false;

        // core

        me.toUpdate = [];
        me.phase = Consts.startPhase;

        me.generators = [
            new Generator(me, 2450, Consts.height.floor - Consts.unit, [
                { x: 2600, y: Consts.height.top + Consts.unit },
                { x: 2800, y: Consts.height.middle + Consts.unit /2 },
                { x: 2050, y: Consts.height.floor + Consts.unit / 2 }
            ]),
            new Generator(me, 600, Consts.height.floor - Consts.unit, [
                { x: 490, y: Consts.height.top + Consts.unit },
                { x: 790, y: Consts.height.middle + Consts.unit / 2 },
                { x: 210, y: Consts.height.floor + Consts.unit / 2 }
            ])
        ];
        me.generators.forEach((x) => x.emitter.on(
            'generatorFinished', 
            me.onGeneratorFinished, 
            me));

        me.key = me.add.sprite(700, Consts.height.floor, 'key')
            .play('key');

        me.rules = new Rules(me.initiedLevel);
        me.toUpdate.push(me.rules);
        me.rules.emitter.on('timeout', me.onTimeout, me);

        me.player = new Player(
            me, 
            Consts.player.startX, 
            Consts.player.startY,
            me.rules.getPlayerSkin());

        const walls = me.createWalls();
        me.stairs = me.createStairs();
        me.stairs.forEach((x) => {
            x.emitter.on('roofJump', me.onRoofJump, me);
        });

        me.physics.add.collider(me.player.container, walls);

        me.snow = new Snow(me, 1);
        me.toUpdate.push(me.snow);

        me.bots = me.rules
            .getBotConfigs()
            .map((cfg) => new Bot(me, cfg.x, Consts.levelType.FLOOR, cfg.skin));

        me.bots.forEach((bot) => {
            me.snow.emitter.on('flakeCreated', bot.onFlakeCreated, bot);  
            me.toUpdate.push(bot);
        });

        me.hud = new HUD(me, me.rules, me.rules.getHeadInidices(), me.rules.getOutOfTime());
        me.toUpdate.push(me.hud);

        // camera

        me.cameras.main.setBounds(0, 0, Consts.worldSize.width, Consts.worldSize.height);
        me.cameras.main.startFollow(me.player.container);

        // other

        if (Consts.debug) {
            me.log = me.add.text(10, 10, '', { fontSize: 14, backgroundColor: '#000' })
                .setScrollFactor(0)
                .setDepth(9999999)
                .setVisible(false);
        }
    }

    update() {
        const me = this;

        me.updateInput();

        me.toUpdate.forEach((x) => x.update());
        me.checkElectricity();

        me.bots.forEach((bot, i) => {
            if (!bot.damaged && me.snow.checkEat(bot.sprite.x, bot.sprite.y)) {
                me.rules.updateScores(true, i);
            }
        });

        if (Consts.debug) {
            me.log.text = 
            `${me.player.container.x | 0} ${me.player.container.y | 0}\n` +
            `${me.input.mousePointer.worldX | 0} ${me.input.mousePointer.worldY | 0}\n` + 
            `${me.rules.scores}\n` +
            `${(me.rules.timer).toFixed(1)}\n` +
            `Level: ${me.rules.level}`;
        }
    }

    onTimeout() {
        const me = this;

        if (me.rules.level >= 4)
            return;

        //TODO : stop all

        me.tweens.add({
            targets: me.add.image(Consts.viewSize.width / 2, Consts.viewSize.height / 2, 'fade')
                .setScrollFactor(0)
                .setAlpha(0)
                .setDepth(9000),
            alpha: { from: 0, to: 1},
            duration: 1000,
            onComplete: () => { 
                me.hud.showWinner();
            }
        });

        me.time.delayedCall(
            7000,
            () => { me.scene.start('game', { level: me.rules.level + 1 }); }
        );
    }

    checkElectricity() {
        const me = this;

        me.generators.forEach((g) => {
            /** @type {Generator} */
            const generator = g;

            if (!generator.running) {
                return;
            }

            me.bots.forEach((bot) => {
                generator.garlands.forEach((garland) => {
                    if (Math.abs(bot.sprite.x - garland.x) < 250
                        && Math.abs(bot.sprite.y - garland.y) < 100) {
                            bot.tryElectricityDamage();
                        }
                });
            });
        })
    }

    onGeneratorFinished(x, y) {
        const me = this;

        me.key
            .setPosition(x, y + Consts.unit)
            .setVisible(true);
    }

    onRoofJump() {
        const me = this;

        if (me.phase != Consts.levelPhase.START)
            return;

        me.phase = Consts.levelPhase.FIGHT;

        me.player.hide();
        me.cameras.main.pan(
            Consts.worldSize.width / 2,
            Consts.worldSize.height,
            2000,
            'Sine.easeInOut');

        me.time.delayedCall(
            3000,
            () => {
                if (me.rules.level < 4)
                   me.runFight();
                else
                    me.runEnding();
            });
    }

    runFight() {
        const me = this;

        me.player.show();
        me.player.container.setPosition(Consts.worldSize.width / 2, 750)
        me.tweens.add({
            targets: me.player.container,
            y: Consts.height.floor,
            duration: 750,
            ease: 'Sine.easeIn',
            onComplete: () => { me.cameras.main.startFollow(me.player.container) }
        });
    }

    runEnding() {
        const me = this;

        const particleX = 1500;
        const particleY = 750;

        me.add.particles('snowflake')
            .createEmitter({
                x: particleX,
                y: particleY,
                angle: { min: 90, max: 90 },
                speed: { min: 40, max: 60 },
                rotate: { start: 0, end: 360  },
                gravityY: 10,
                lifespan: { min: 10000, max: 10000 },
                blendMode: 'ADD',
                scale: { min: 0.2, max: 0.5 },
                emitZone: { 
                    source: 
                    new Phaser.Geom.Rectangle(
                        -Consts.viewSize.width / 2, 
                        0, 
                        Consts.viewSize.width + Consts.unit, 
                        10)
                    },
                deathZone: { 
                    type: 'onEnter', 
                    source: new Phaser.Geom.Rectangle(
                        particleX - (Consts.viewSize.width * 1.5 / 2), 
                        1700, 
                        Consts.viewSize.width * 1.5, 
                        200) 
                    },
            });

        const thankText = me.add.sprite(1500, 1000, 'thank_text').setAlpha(0);
        const christmasText = me.add.sprite(1500, 1100, 'christmas_text').setAlpha(0);

        me.time.delayedCall(
            3000,
            () => {
                me.tweens.add({
                    targets: thankText,
                    alpha: { from: 0, to: 1},
                    duration: 2000,
                    repeat: 0
                });
            }
        );

        me.time.delayedCall(
            5000,
            () => {
                me.tweens.add({
                    targets: christmasText,
                    alpha: { from: 0, to: 1},
                    duration: 2000,
                    repeat: 0
                });
            }
        );
    }

    updateInput() {
        const me = this;

        let needCheckX = false;
        if (me.keys.x.isDown) {
            if (!me.isMultipleXPress) {
                me.isMultipleXPress = true;
                needCheckX = true
            }
        } else {
            me.isMultipleXPress = false;
        }

        if (needCheckX && me.checkKey())
            return;

        if (me.checkEat())
            return;

        if (me.tryClimb())        
            return;

        const movement = me.keys.left.isDown || me.keys.right.isDown;
        const direction = movement
            ? me.keys.left.isDown ? -1 : 1
            : 0;
        
        me.player.move(direction);
    }

    checkKey() {
        const me = this;

        if (!me.keys.x.isDown || !me.isMultipleXPress)
            return false;

        if (me.player.hasKey) {

            const generator = Utils.firstOrDefault(
                me.generators, 
                (gen) => gen.canStart(me.player.container.x, me.player.container.y));

            if (!!generator) {
                generator.start();
            } else {
                me.key
                    .setPosition(me.player.container.x, me.player.container.y)
                    .setVisible(true);
            }

            me.player.throwKey();
        }
        else {
            const dist = Phaser.Math.Distance.Between(
                me.player.container.x,
                me.player.container.y,
                me.key.x,
                me.key.y
            );
    
            if (dist > Consts.unit)
                return false;
    
            me.key.setVisible(false);
            me.player.takeKey();
    
            return true;
        }
    }

    checkEat() {
        const me = this;

        if (me.player.isEat) {
            const stopEat = !me.keys.z.isDown;

            if (stopEat) {
                me.player.stopEat();
                if (me.snow.checkEat(me.player.container.x, me.player.container.y)) {
                    me.rules.updateScores(false);
                }
            }

            return !stopEat;
        } 
        else {
            const startEat = me.keys.z.isDown;
            
            if (startEat)
                me.player.startEat();

            return startEat;
        }
    }

    tryClimb() {
        const me = this;

        const climb = me.keys.up.isDown || me.keys.down.isDown;
        if (!climb) 
            return false;
            
        const type = me.keys.up.isDown 
            ? Consts.stairType.UP 
            : me.phase == Consts.levelPhase.FIGHT ? Consts.stairType.DOWN : Consts.stairType.ROOF;

        /** @type {Stair} */
        const stair = Utils.firstOrDefault(
            me.stairs, 
            (a) => a.type == type 
                    && Consts.triggerDistance > Phaser.Math.Distance.Between(
                        me.player.container.x, 
                        me.player.container.y, 
                        a.sprite.x, 
                        a.sprite.y));

        if (!stair)
            return false;

        stair.move(me.player.container);

        if (type == Consts.stairType.ROOF) {
            me.cameras.main.stopFollow();
        }

        return true;
    }

    createStairs() {
        const me = this;
        
        return [
            [ 72, Consts.height.floor, Consts.height.middle, Consts.stairType.UP ],
            [ 286, Consts.height.middle, Consts.height.top, Consts.stairType.UP ],
            [ 400, Consts.height.middle, Consts.height.floor, Consts.stairType.DOWN ],
            [ 680, Consts.height.top, Consts.height.middle, Consts.stairType.DOWN ],
            [ 1100, Consts.height.middle, Consts.height.floor, Consts.stairType.DOWN ],
            [ 2925, Consts.height.floor, Consts.height.middle, Consts.stairType.UP ],
            [ 2680, Consts.height.middle, Consts.height.top, Consts.stairType.UP ],
            [ 2245, Consts.height.middle, Consts.height.top, Consts.stairType.UP ],
            [ 2450, Consts.height.top, Consts.height.middle, Consts.stairType.DOWN ],
            [ 2900, Consts.height.top, Consts.height.middle, Consts.stairType.DOWN ],
            [ 2070, Consts.height.middle, Consts.height.floor, Consts.stairType.DOWN ],
            [ 2050, Consts.height.roof, Consts.height.floor, Consts.stairType.ROOF ]
        ]
        .map((a) => new Stair(me, a[0], a[1], a[2], a[3], a[4]));
    }

    loadSpriteSheet(name, x, y) {
        const me = this;

        return me.load.spritesheet(name, `assets/${name}.png`, {
            frameWidth: x,
            frameHeight: !!y ? y : x
        });
    }

    loadImage(name) {
        const me = this;

        return me.load.image(name, `assets/${name}.png`);
    }

    createWalls() {
        const me = this;

        const walls = me.physics.add.staticGroup();
        [
            [ 3012, 1500 ],
            [ 0, 1500 ],
            [ 40, 1260 ],
            [ 1175, 1260 ],
            [ 2000, 1260 ],
            [ 2950, 1260 ],
            [ 2950, 1000 ],
            [ 2625, 1000 ],
            [ 2500, 1000 ],
            [ 2200, 1000 ],
            [ 230, 1000 ],
            [ 750, 1000 ],
            [ 2000, 540],
            [ 3012, Consts.height.roof ]
        ]
        .forEach((pos) => {
            /** @type {Phaser.Physics.Arcade.Sprite} */
            const wall = walls.create(pos[0], pos[1], 'wall');
            wall.setVisible(Consts.showWalls);
        });

        return walls;
    }

    createAnimation() {
        const me = this;

        me.anims.create({
            key: 'small_arrow_up',
            frames: me.anims.generateFrameNumbers('small_arrows', { frames: [ 1, 1, 1, 0 ]}),
            frameRate: 2,
            repeat: -1
        });

        me.anims.create({
            key: 'key',
            frames: 'key',
            frameRate: 2,
            repeat: -1
        });

        me.anims.create({
            key: 'generator',
            frames: me.anims.generateFrameNumbers('generator', { frames: [ 1, 2, 3 ]}),
            frameRate: 10,
            repeat: -1
        });

        me.anims.create({
            key: 'garland',
            frames: me.anims.generateFrameNumbers('garland', { frames: [ 0, 1 ]}),
            frameRate: 10,
            repeat: -1
        });

        me.anims.create({
            key: 'electricity',
            frames: 'electricity',
            frameRate: 15,
            repeat: -1
        });

        me.anims.create({
            key: 'small_arrow_down',
            frames: me.anims.generateFrameNumbers('small_arrows', { frames: [ 2, 2, 2, 0 ]}),
            frameRate: 2,
            repeat: -1
        });

        for (let i = 0; i < 14; ++i) {
            me.anims.create({
                key: `kid_${i}_walk`,
                frames: me.anims.generateFrameNumbers('kids', { frames: [ 
                    i * Consts.skinOffset + 0, 
                    i * Consts.skinOffset + 1 ]}),
                frameRate: 10,
                repeat: -1
            });    
        }
    }
}