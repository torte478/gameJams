import Phaser from '../lib/phaser.js';

import Consts from '../game/Consts.js';
import Player from '../game/Player.js';
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

    constructor() {
        super('game');
    }

    preload() {
        const me = this;

        me.loadImage('background')
        me.loadImage('sky');
        me.loadImage('wall');
        me.loadSpriteSheet('small_arrows', 50);
        me.loadImage('snowflake')
        me.loadSpriteSheet('kids', 100);
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

        // core

        me.toUpdate = [];

        me.player = new Player(me, Consts.player.startX, Consts.player.startY);

        const walls = me.createWalls();
        me.stairs = me.createStairs();

        me.physics.add.collider(me.player.sprite, walls);

        const snow = new Snow(me, 1);
        me.toUpdate.push(snow);

        // camera

        me.cameras.main.setBounds(0, 0, Consts.worldSize.width, Consts.worldSize.height);
        me.cameras.main.startFollow(me.player.sprite);

        // other

        if (Consts.debug) {
            me.log = me.add.text(10, 10, '', { fontSize: 14, backgroundColor: '#000' })
                .setScrollFactor(0);
        }
    }

    update() {
        const me = this;

        me.updateInput();

        me.toUpdate.forEach((x) => x.update());

        if (Consts.debug) {
            me.log.text = 
            `${me.player.sprite.x | 0} ${me.player.sprite.y | 0}\n` +
            `${me.input.mousePointer.worldX | 0} ${me.input.mousePointer.worldY | 0}`;
        }
    }

    updateInput() {
        const me = this;

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

    checkEat() {
        const me = this;

        if (me.player.isEat) {
            const stopEat = !me.keys.z.isDown;

            if (stopEat)
                me.player.stopEat();

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
            
        const type = me.keys.up.isDown ? Consts.stairType.UP : Consts.stairType.DOWN;

        /** @type {Stair} */
        const stair = Utils.firstOrDefault(
            me.stairs, 
            (a) => a.type == type 
                    && Consts.triggerDistance > Phaser.Math.Distance.Between(
                        me.player.sprite.x, 
                        me.player.sprite.y, 
                        a.sprite.x, 
                        a.sprite.y));

        if (!stair)
            return false;

        stair.move(me.player.sprite);
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
        ]
        .map((a) => new Stair(me, a[0], a[1], a[2], a[3], a[4]));
    }

    loadSpriteSheet(name, size) {
        const me = this;

        return me.load.spritesheet(name, `assets/${name}.png`, {
            frameWidth: size,
            frameHeight: size
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
            key: 'small_arrow_down',
            frames: me.anims.generateFrameNumbers('small_arrows', { frames: [ 2, 2, 2, 0 ]}),
            frameRate: 2,
            repeat: -1
        });

        me.anims.create({
            key: 'kid_0_walk',
            frames: me.anims.generateFrameNumbers('kids', { frames: [ 0, 1 ]}),
            frameRate: 10,
            repeat: -1
        });
    }
}