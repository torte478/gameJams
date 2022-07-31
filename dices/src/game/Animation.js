import Phaser from '../lib/phaser.js';

export default class Animation {

    /**
     * @param {Phaser.Scene} scene 
     */
    static init(scene) {
        scene.anims.create({
            key: 'dice_roll',
            frames: Animation.getFrames(scene, 'dice', [ 6, 7, 8, 9, 10, 11 ]),
            frameRate: 32,
            repeat: -1
        });
    }

    static getFrames(scene, texture, frames) {
        return scene.anims.generateFrameNames(texture, { frames: frames });
    }
}