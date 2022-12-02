import Phaser from '../../lib/phaser.js';

export default class Animation {

    /**
     * @param {Phaser.Scene} scene 
     */
    static init(scene) {
        // scene.anims.create({
        //     key: 'ANIM_NAME',
        //     frames: Animation.getFrames(scene, 'ASSET_NAME', [ 1, 2, 3 ]),
        //     frameRate: 24,
        //     repeat: -1
        // });
    }

    static getFrames(scene, texture, frames) {
        return scene.anims.generateFrameNames(texture, { frames: frames });
    }
}