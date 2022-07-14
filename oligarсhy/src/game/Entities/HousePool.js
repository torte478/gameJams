import Phaser from '../../lib/phaser.js';

import Consts from '../Consts.js';

export default class HousePool {

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
     * @returns {Phaser.GameObjects.Image}
     */
    createHouse() {
        const me = this;

        return me._group.create(0, 0, 'houses', 0)
            .setDepth(Consts.Depth.Houses);
    }

    /**
     * @returns {Phaser.GameObjects.Image}
     */
    createHotel() {
        const me = this;

        return me._group.create(0, 0, 'houses', 2)
            .setDepth(Consts.Depth.Houses);
    }

    /**
     * @param {Phaser.GameObjects.GameObject} obj
     */
    remove(obj) {
        const me = this;

        me._group.killAndHide(obj);
    }
}