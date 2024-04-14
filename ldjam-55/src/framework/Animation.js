import Here from "./Here.js";

export default class Animation {

    static init() {
        Here._.anims.create({
            key: 'smoke',
            frames: 'smoke', // frames: Animation.getFrames('ASSET_NAME', [ 1, 2, 3 ]),
            frameRate: 12,
            repeat: -1
        });

        Here._.anims.create({
            key: 'lattern',
            frames: 'lattern',
            frameRate: 16,
            repeat: -1
        });
    }

    static getFrames(texture, frames) {
        return Here._.anims.generateFrameNames(texture, { frames: frames });
    }
}