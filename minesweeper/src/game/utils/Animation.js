import Phaser from '../../lib/phaser.js';

export default class Animation {

    /**
     * @param {Phaser.Scene} scene 
     */
    static init(scene) {
        scene.anims.create({
            key: 'parachute',
            frames: Animation.getFrames(scene, 'items', [ 0, 1 ]),
            frameRate: 8,
            repeat: -1
        });

        scene.anims.create({
            key: 'mine_explosion',
            frames: Animation.getFrames(scene, 'explosions', [0, 1, 2, 3, 2, 3, 2, 3, 4, 5]),
            frameRate: 16,
        });

        scene.anims.create({
            key: 'mine_smoke',
            frames: Animation.getFrames(scene, 'items', [ 10, 11 ]),
            frameRate: 1,
            repeat: -1
        });

        scene.anims.create({
            key: 'soldier_movement',
            frames: Animation.getFrames(scene, 'soldiers', [ 1, 2, 3, 2 ]),
            frameRate: 8,
            repeat: -1
        });
    }

    static getFrames(scene, texture, frames) {
        return scene.anims.generateFrameNames(texture, { frames: frames });
    }
}