import Phaser from '../../lib/phaser.js';

export default class Animation {

    /**
     * @param {Phaser.Scene} scene 
     */
    static init(scene) {

        scene.anims.create({
            key: 'player_idle',
            frames: Animation.getFrames(scene, 'player', [ 0, 1 ]),
            frameRate: 2,
            repeat: -1
        });

        scene.anims.create({
            key: 'player_walk',
            frames: Animation.getFrames(scene, 'player', [ 2, 3, 4, 3 ]),
            frameRate: 12,
            repeat: -1
        });

        scene.anims.create({
            key: 'player_jump',
            frames: Animation.getFrames(scene, 'player', [ 5 ]),
            frameRate: 1,
            repeat: -1
        });

        scene.anims.create({
            key: 'square_walk',
            frames: Animation.getFrames(scene, 'square', [ 0, 1, 2, 3, 4 ]),
            frameRate: 4,
            yoyo: true,
            repeat: -1
        });
    }

    static getFrames(scene, texture, frames) {
        return scene.anims.generateFrameNames(texture, { frames: frames });
    }
}