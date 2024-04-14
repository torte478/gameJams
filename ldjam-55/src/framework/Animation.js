import Here from "./Here.js";

export default class Animation {

    static init() {
        Here._.anims.create({
            key: 'smoke',
            frames: 'smoke',
            frameRate: 12,
            repeat: -1
        });

        Here._.anims.create({
            key: 'lattern',
            frames: 'lattern',
            frameRate: 16,
            repeat: -1
        });

        Here._.anims.create({
            key: 'shield',
            frames: 'shield',
            frameRate: 8,
            repeat: -1
        });

        Here._.anims.create({
            key: 'insect',
            frames: Animation.getFrames('insect', [ 0, 1 ]),
            frameRate: 4,
            repeat: -1
        });

        Here._.anims.create({
            key: 'gun',
            frames: Animation.getFrames('gun', [ 1, 2, 0 ]),
            frameRate: 8
        });

        Here._.anims.create({
            key: 'blood',
            frames: 'blood',
            frameRate: 16
        });
    }

    static getFrames(texture, frames) {
        return Here._.anims.generateFrameNames(texture, { frames: frames });
    }
}