import Phaser from '../lib/phaser.js';

export default class Animation {

    /**
     * @param {Phaser.Scene} scene 
     */
    static init(scene) {
        scene.anims.create({
            key: 'first_dice_roll',
            frames: me.anims.generateFrameNames('dice', { frames: [ 7, 8, 9, 10, 11, 12, 13, 14 ]}),
            frameRate: 24,
            repeat: -1
        });

        scene.anims.create({
            key: 'second_dice_roll',
            frames: me.anims.generateFrameNames('dice', { frames: [ 10, 11, 12, 13, 14, 7, 8, 9 ]}),
            frameRate: 25,
            repeat: -1
        });
    }
}