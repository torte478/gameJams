import Phaser from '../lib/phaser.js';

import Consts from './Consts.js';
import Keyboard from './Keyboard.js';

export default class Player {

    /** @type {Phaser.GameObjects.Image} */
    body;

    /** @type {Phaser.GameObjects.Image} */
    hands;

    /** @type {Phaser.GameObjects.Container} */
    container;

    /** @type {Boolean} */
    donkey = false;

    /** @type {Keyboard} */
    keyboard;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Phaser.Geom.Point} point
     * @param {Phaser.GameObjects.Sprite} body 
     * @param {Phaser.GameObjects.Sprite} hands 
     * @param {Keyboard} keyboard
     */
    constructor(scene, pos, body, hands, keyboard) {
        const me = this;

        me.body = body;
        me.hands = hands;
        me.keyboard = keyboard;

        me.container = scene.add.container(pos.x, pos.y, [ body, hands]);
        me.container.setSize(body.width, body.height);
        scene.physics.world.enable(me.container);

        scene.anims.create({
            key: 'player',
            frames: 'player',
            frameRate: 5,
            repeat: -1
        });

        me.body.play('player');
    }

    update() {
        const me = this;
    
        let sign = {
            x: 0,
            y: 0
        };

        if (me.keyboard.isPressed(Phaser.Input.Keyboard.KeyCodes.UP)) 
            sign.y = -1;
        else if (me.keyboard.isPressed(Phaser.Input.Keyboard.KeyCodes.DOWN)) 
            sign.y = 1;

        if (me.keyboard.isPressed(Phaser.Input.Keyboard.KeyCodes.LEFT)) 
            sign.x = -1;
        else if (me.keyboard.isPressed(Phaser.Input.Keyboard.KeyCodes.RIGHT)) 
            sign.x = 1;

        const velocity = me.donkey ? Consts.donkeyVelocity : Consts.playerVelocity;

        me.container.body.setVelocity(
            sign.x * velocity, 
            sign.y * velocity);
    }
}