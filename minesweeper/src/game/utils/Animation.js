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
            frames: Animation.getFrames(scene, 'explosions', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13]),
            frameRate: 24,
        });

        scene.anims.create({
            key: 'mine_smoke',
            frames: Animation.getFrames(scene, 'items', [ 9, 10, 11 ]),
            frameRate: 1,
            repeat: -1
        });

        scene.anims.create({
            key: 'soldier_movement',
            frames: Animation.getFrames(scene, 'soldiers', [ 1, 2, 3, 4, 5, 4, 3, 2 ]),
            frameRate: 16,
            repeat: -1
        });

        scene.anims.create({
            key: 'arrow_reserve',
            frames: Animation.getFrames(scene, 'items', [ 25, 26, 27 ]),
            frameRate: 8,
            yoyo: true,
            repeat: -1
        });

        scene.anims.create({
            key: 'clock_alarm',
            frames: 'clock',
            frameRate: 2,
            repeat: -1
        });

        scene.anims.create({
            key: 'soldier_dodge',
            frames: Animation.getFrames(scene, 'soldiers', [ 6, 7, 6, 7, 6, 7, 6, 7, 0 ]),
            frameRate: 8,
        });

        scene.anims.create({
            key: 'solder_cant',
            frames: Animation.getFrames(scene, 'items', [ 19, 29, 19, 29 ]),
            frameRate: 4
        });

        for (let i = 0; i < 4; ++i) {

            const indicies = [];
            for (let j = 0; j < 6; ++j)
                indicies.push(6 * i + j);
            for (let j = 4; j > 0; --j)
                indicies.push(6 * i + j);

            scene.anims.create({
                key: `citizen_movement_${i}`,
                frames: Animation.getFrames(scene, 'citizens', indicies),
                frameRate: 8,
                repeat: -1
            });
        }
    }

    static getFrames(scene, texture, frames) {
        return scene.anims.generateFrameNames(texture, { frames: frames });
    }
}