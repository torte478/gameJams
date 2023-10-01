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
    }

    static getFrames(texture, frames) {
        return Here._.anims.generateFrameNames(texture, { frames: frames });
    }
}