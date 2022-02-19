import Phaser from '../lib/phaser.js';
import Consts from './Consts.js';

export default class Groups {

    /** @type {Phaser.GameObjects.Group} */
    _group;

    /**
     * @param {Phaser.GameObjects.GameObjectFactory} factory 
     */
    constructor(factory) {
        const me = this;

        me._group = factory.group();
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

        return me._group.create(0, 0, 'houses', 2);
    }

    /**
     * @param {Phaser.GameObjects.GameObject} obj 
     */
    kill(obj) {
        const me = this;

        me._group.killAndHide(obj);
    }
}