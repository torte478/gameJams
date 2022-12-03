import Phaser from '../lib/phaser.js';
import Config from './Config.js';
import Consts from './Consts.js';
import GunLogic from './GunLogic.js';

export default class GUI {

    /** @type {Phaser.GameObjects.Graphics} */
    _chargeBarMask;

    /** @type {GunLogic} */
    _gunLogic;

    /** @type {Number} */
    _startMaskPosition;

    /**
     * @param {Phaser.Scene} scene 
     * @param {GunLogic} gunLogic
     */
    constructor(scene, gunLogic) {
        const me = this;

        me._gunLogic = gunLogic;

        scene.add.image(scene.cameras.main.width / 2, 50, 'charge_bar', 0)
            .setDepth(Consts.Depth.GUI)
            .setScrollFactor(0);

        const bar = scene.add.image(scene.cameras.main.width / 2, 50, 'charge_bar', 1)
            .setDepth(Consts.Depth.GUI)
            .setScrollFactor(0);

        me._chargeBarMask = scene.make.graphics();
        me._chargeBarMask.setScrollFactor(0);
        me._chargeBarMask.beginPath();

        me._startMaskPosition = scene.cameras.main.width / 2 - 350;

        me._chargeBarMask.fillRect(me._startMaskPosition, 0, 700, 100);
        const mask = me._chargeBarMask.createGeometryMask();
        bar.setMask(mask);
    }

    update() {
        const me = this;

        const gunChargePercent = me._gunLogic._charge / Config.Start.GunCharge;
        const newPosition = -700 * (1 - gunChargePercent);
        me._chargeBarMask.setPosition(newPosition, 0);
    }
}