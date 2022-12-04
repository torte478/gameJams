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
            frames: Animation.getFrames(scene, 'square', [ 0, 1, 2, 3, 4, 5 ]),
            frameRate: 4,
            yoyo: true,
            repeat: -1
        });

        scene.anims.create({
            key: 'triangle_walk',
            frames: Animation.getFrames(scene, 'triangle', [ 0, 1, 2, 3, 4, 5 ]),
            frameRate: 16,
            yoyo: true,
            repeat: -1
        });

        scene.anims.create({
            key: 'triangle_idle',
            frames: Animation.getFrames(scene, 'triangle', [ 6 ]),
            frameRate: 1,
            repeat: -1
        });

        scene.anims.create({
            key: 'circle_blue_fly',
            frames: Animation.getFrames(scene, 'circle', [ 0, 1 ]),
            frameRate: 12,
            repeat: -1
        });

        scene.anims.create({
            key: 'circle_yellow_fly',
            frames: Animation.getFrames(scene, 'circle', [ 2, 3 ]),
            frameRate: 12,
            repeat: -1
        });

        scene.anims.create({
            key: 'circle_red_fly',
            frames: Animation.getFrames(scene, 'circle', [ 4, 5 ]),
            frameRate: 12,
            repeat: -1
        });

        scene.anims.create({
            key: 'charger_charge',
            frames: Animation.getFrames(scene, 'charger', [ 3, 4, 5, 6, 7, 8 ]),
            frameRate: 6,
            repeat: -1
        });

        scene.anims.create({
            key: 'player_idle_inside',
            frames: Animation.getFrames(scene, 'player', [ 7, 8 ]),
            frameRate: 2,
            repeat: -1
        });

        scene.anims.create({
            key: 'player_walk_inside',
            frames: Animation.getFrames(scene, 'player', [ 9, 10 ]),
            frameRate: 4,
            repeat: -1
        });

        scene.anims.create({
            key: 'player_fire',
            frames: Animation.getFrames(scene, 'player', [ 11, 12 ]),
            frameRate: 1,
            repeat: -1
        });

        scene.anims.create({
            key: 'fire',
            frames: Animation.getFrames(scene, 'main', [ 4, 5 ]),
            frameRate: 3,
            repeat: -1
        });
    }

    static getFrames(scene, texture, frames) {
        return scene.anims.generateFrameNames(texture, { frames: frames });
    }
}