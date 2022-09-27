import Phaser from '../lib/phaser.js';

export default class Button {

    /**
     * 
     * @param {Phaser.Scene} scene 
     * @param {Number} x 
     * @param {Number} y 
     * @param {String} texture 
     * @param {Number} idleIndex 
     * @param {Number} selectedIndex 
     * @param {Function} callback 
     * @param {String} sound 
     */
    constructor(scene, x, y, texture, idleIndex, selectedIndex, callback, sound) {
        const me = this;

        const sprite = scene.add.sprite(x, y, texture, idleIndex).setInteractive();
        sprite.on('pointerdown', () => {

            sprite.setScale(0.75);
            scene.time.delayedCall(500, () => { sprite.setScale(1) });

            if (!!sound)
                scene.sound.play(sound);

            scene.time.delayedCall(200, callback);
        });

        sprite.on('pointerover', () => { sprite.setFrame(selectedIndex) });
        sprite.on('pointerout', () => { sprite.setFrame(idleIndex) });
    }
}