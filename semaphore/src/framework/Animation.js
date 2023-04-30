import Here from "./Here.js";

export default class Animation {

    static init() {

        Here._.anims.create({
            key: 'seagull_fly',
            frames: Animation.getFrames('seagull_small', [ 0, 1, 2, 3, 4, 5, 6, 7 ]),
            frameRate: 16,
            repeat: -1
        });
    }

    static getFrames(texture, frames) {
        return Here._.anims.generateFrameNames(texture, { frames: frames });
    }
}