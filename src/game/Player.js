import Phaser from '../lib/phaser.js';

import Consts from './Consts.js';

export default class Player {

    /** @type {Phaser.Physics.Arcade.Sprite} */
    sprite;

    constructor(sprite) {
        this.sprite = sprite;
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

        this.sprite.setVelocity(
            sign.x * Consts.playerVelocity, 
            sign.y * Consts.playerVelocity);
    }
}