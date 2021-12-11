import Phaser from '../lib/phaser.js';

import Consts from '../game/Consts.js';
import Player from '../game/Player.js';

export default class Game extends Phaser.Scene {

    keys = {
        left: null,
        right: null,
    }

    /** @type {Player} */
    player;

    /** @type {Phaser.GameObjects.Text} */
    log;

    constructor() {
        super('game');
    }

    preload() {
        const me = this;

        me.loadImage('background')
        me.loadImage('sky');
        me.loadImage('player');
        me.loadImage('wall');
    }

    create() {
        const me = this;

        me.add.image(Consts.viewSize.width / 2, Consts.viewSize.height / 2, 'sky').setScrollFactor(0);
        me.add.image(Consts.worldSize.width / 2, Consts.worldSize.height / 2, 'background');

        me.keys.left = me.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        me.keys.right = me.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

        me.player = new Player(me, Consts.player.startX, Consts.player.startY);

        me.cameras.main.setBounds(0, 0, Consts.worldSize.width, Consts.worldSize.height);
        me.cameras.main.startFollow(me.player.sprite);

        const walls = me.createWalls();

        me.physics.add.collider(me.player.sprite, walls);

        if (Consts.debug) {
            me.log = me.add.text(10, 10, '', { fontSize: 14}).setScrollFactor(0);
        }
    }

    update() {
        const me = this;

        const movement = me.keys.left.isDown || me.keys.right.isDown;
        const direction = movement
            ? me.keys.left.isDown ? -1 : 1
            : 0;
        
        me.player.move(direction);

        if (Consts.debug) {
            me.log.text = `${me.player.sprite.x | 0} ${me.player.sprite.y | 0}`;
        }
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
}