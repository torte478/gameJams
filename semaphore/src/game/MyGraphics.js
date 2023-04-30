import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Consts from "./Consts.js";

export default class MyGraphics {

    /** @type {Phaser.GameObjects.Group} */
    static _group;

    constructor() {
        const me = this;

        MyGraphics._group = Here._.add.group();
    }

    static runMinusOne(pos) {
        /** @type {Phaser.GameObjects.Image} */
        const minus = MyGraphics._group.get(
            pos.x, 
            pos.y, 
            'minus_one');

        minus
            .setActive(true)
            .setAlpha(1)
            .setVisible(true)
            .setDepth(Consts.Depth.SEAGULL_BIG);

        Here._.tweens.add({
            targets: minus,
            x: pos.x + Utils.getRandom(-200, 200),
            y: pos.y + Utils.getRandom(-200, 200),
            duration: 1000,
            alpha: { from: 1, to: 0},
            ease: 'sine.out',
            onComplete: () => {
                MyGraphics._group.killAndHide(minus);
            }
        });
    }
}