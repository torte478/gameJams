import Phaser from '../../lib/phaser.js';

export default class Button {

    /**
     * @param {Phaser.GameObjects.Sprite} sprite 
     * @param {Function} callback 
     * @param {Context} context 
     */
    constructor(sprite, callback, context) {
        const me = this;

        sprite.setInteractive();
        sprite.on('pointerdown', callback, context);
    }
}