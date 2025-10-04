import Here from "./Here.js";

export default class Animation {

    static init() {
        // scene.anims.create({
        //     key: 'ANIM_NAME',
        //     frames: Animation.getFrames('ASSET_NAME', [ 1, 2, 3 ]),
        //     frameRate: 24,
        //     repeat: -1
        // });
    }

    static getFrames(texture, frames) {
        return Here._.anims.generateFrameNames(texture, { frames: frames });
    }
}