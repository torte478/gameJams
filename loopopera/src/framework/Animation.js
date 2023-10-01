import Here from "./Here.js";

export default class Animation {

    static init() {
        Here._.anims.create({
            key: 'hand_start',
            frames: Animation.getFrames('hand', [ 0, 1, 2, 3 ]),
            frameRate: 4
        });
        Here._.anims.create({
            key: 'hand_attack',
            frames: Animation.getFrames('hand', [ 4, 5, 6, 7 ]),
            frameRate: 8
        });

        Here._.anims.create({
            key: 'player_idle',
            frames: Animation.getFrames('player', [ 0, 1 ]),
            frameRate: 1,
            repeat: -1
        });

        Here._.anims.create({
            key: 'player_walk',
            frames: Animation.getFrames('player', [ 2, 3, 4, 5, 6, 7 ]),
            frameRate: 6,
            repeat: -1
        });

        Here._.anims.create({
            key: 'player_jump_up',
            frames: Animation.getFrames('player', [ 8, 9 ]),
            frameRate: 2,
            repeat: -1
        });

        Here._.anims.create({
            key: 'player_jump_down',
            frames: Animation.getFrames('player', [ 10, 11 ]),
            frameRate: 2,
            repeat: -1
        });

        Here._.anims.create({
            key: 'player_death',
            frames: Animation.getFrames('player', [ 12 ]),
            frameRate: 1,
            repeat: -1
        });

        Here._.anims.create({
            key: 'boss',
            frames: Animation.getFrames('boss', [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ]),
            frameRate: 8,
            repeat: -1,
            yoyo: true
        });

        Here._.anims.create({
            key: 'scarecrow',
            frames: Animation.getFrames('scarecrow', [ 0, 1]),
            frameRate: 4,
            repeat: -1
        });
    }

    static getFrames(texture, frames) {
        return Here._.anims.generateFrameNames(texture, { frames: frames });
    }
}