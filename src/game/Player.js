import Phaser from '../lib/phaser.js';

import Consts from './Consts.js';

export default class Player {

    /** @type {Phaser.GameObjects.Image} */
    body;

    /** @type {Phaser.GameObjects.Image} */
    hands;

    /** @type {Phaser.GameObjects.Container} */
    container;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Number} x
     * @param {Number} y
     * @param {Phaser.GameObjects.Sprite} body 
     * @param {Phaser.GameObjects.Sprite} hands 
     */
    constructor(scene, x, y, body, hands) {
        this.body = body;
        this.hands = hands;

        this.container = scene.add.container(x, y, [ body, hands]);
        this.container.setSize(body.width, body.height);
        scene.physics.world.enable(this.container);

        scene.anims.create({
            key: 'player',
            frames: 'player',
            frameRate: 5,
            repeat: -1
        });

        this.body.play('player');
    }

    /**
     * @param {Phaser.Types.Input.Keyboard.CursorKeys} cursorKeys 
     */
    update(cursorKeys) {
        let sign = {
            x: 0,
            y: 0
        };

        if (cursorKeys.up.isDown) 
            sign.y = -1;
        else if (cursorKeys.down.isDown)
            sign.y = 1;

        if (cursorKeys.left.isDown)
            sign.x = -1;
        else if (cursorKeys.right.isDown)
            sign.x = 1;

        this.container.body.setVelocity(
            sign.x * Consts.playerVelocity, 
            sign.y * Consts.playerVelocity);
    }
}