import Phaser from '../../lib/phaser.js';
import Consts from '../Consts.js';
import Helper from '../Helper.js';

export default class Groups {

    /** @type {Phaser.GameObjects.Group} */
    _houseGroup;

    /** @type {Phaser.GameObjects.Group} */
    _billGroup;

    /**
     * @param {Phaser.Scene} scene
     */
    constructor(scene) {
        const me = this;

        me._houseGroup = scene.add.group();
        me._billGroup = scene.add.group();
    }

    /**
     * @returns {Phaser.GameObjects.Image}
     */
    createHouse() {
        const me = this;

        return me._houseGroup.create(0, 0, 'houses', 0)
            .setDepth(Consts.Depth.Houses);
    }

    /**
     * @returns {Phaser.GameObjects.Image}
     */
    createHotel() {
        const me = this;

        return me._houseGroup.create(0, 0, 'houses', 2);
    }

    /**
     * @param {Phaser.GameObjects.GameObject} obj 
     */
    killBuilding(obj) {
        const me = this;

        me._houseGroup.killAndHide(obj);
    }

    createBill(x, y, side, index) {
        const me = this;

        return me._billGroup.create(x, y, 'money', index * 2)
            .setAngle(Helper.getAngle(side, true))
            .setDepth(Consts.Depth.ActiveItem);
    }

    killBill(obj) {
        const me = this;

        me._billGroup.killAndHide(obj);
    }
}