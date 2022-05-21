import Phaser from '../../lib/phaser.js';

import Consts from '../Consts.js';
import Helper from '../Helper.js';

export default class BillPool {

    /** @type {Phaser.GameObjects.Group} */
    _group;

    /**
     * @param {Phaser.Scene} scene
     */
    constructor(scene) {
        const me = this;

        me._group = scene.add.group();
    }

    /**
     * @param {Number} x
     * @param {Number} y
     * @param {Number} side
     * @param {Number} index
     * @returns {Phaser.GameObjects.Image}
     */
    create(x, y, side, index) {
        const me = this;

        return me._group.create(x, y, 'money', index * 2)
            .setAngle(Helper.getAngle(side, true))
            .setDepth(Consts.Depth.ActiveItem);
    }

    /**
     * @param {Phaser.GameObjects.GameObject} obj
     */
    remove(obj) {
        const me = this;

        me._group.killAndHide(obj);
    }
}
