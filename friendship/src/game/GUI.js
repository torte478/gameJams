import Phaser from '../lib/phaser.js';
import Config from './Config.js';
import Consts from './Consts.js';
import EnemyCatcher from './EnemyCatcher.js';
import Enums from './Enums.js';
import GunLogic from './GunLogic.js';

export default class GUI {

    /** @type {Phaser.GameObjects.Graphics} */
    _chargeBarMask;

    /** @type {GunLogic} */
    _gunLogic;

    /** @type {Number} */
    _startMaskPosition;

    /** @type {Object[]} */
    _enemies;

    /** @type {EnemyCatcher} */
    _enemyCatcher;

    /**
     * @param {Phaser.Scene} scene 
     * @param {GunLogic} gunLogic
     * @param {EnemyCatcher} enemyCatcher
     */
    constructor(scene, gunLogic, enemyCatcher) {
        const me = this;

        me._gunLogic = gunLogic;
        me._enemyCatcher = enemyCatcher;

        const offset = 340;

        scene.add.image(offset, 50, 'charge_bar', 0)
            .setDepth(Consts.Depth.GUI)
            .setScrollFactor(0);

        const bar = scene.add.image(offset, 50, 'charge_bar', 1)
            .setDepth(Consts.Depth.GUI)
            .setScrollFactor(0);

        me._chargeBarMask = scene.make.graphics();
        me._chargeBarMask.setScrollFactor(0);
        me._chargeBarMask.beginPath();

        me._startMaskPosition = offset - 300;

        me._chargeBarMask.fillRect(me._startMaskPosition, 0, 600, 100);
        const mask = me._chargeBarMask.createGeometryMask();
        bar.setMask(mask);

        me._enemies = [];
        for (let i = 0; i < 3; ++i) {
            const enemySprite = scene.add.image(0, 0, 'big', 6 + i);

            const complete = scene.add.image(25, 25, 'main', 3)
                .setVisible(false);

            const text = scene.add.text(0, 25, '0/0', { fontSize: 30})
                .setStroke('#6a7798', 8);

            const container = scene.add.container(700 + 115 * i, 50, [ enemySprite, complete, text ])
                .setDepth(Consts.Depth.GUI)
                .setScrollFactor(0);

            me._enemies.push({
                container: container,
                complete: complete,
                text: text
            });
        }
    }

    update() {
        const me = this;

        const gunChargePercent = me._gunLogic._charge / Config.Start.GunCharge;
        const newPosition = -600 * (1 - gunChargePercent);
        me._chargeBarMask.setPosition(newPosition, 0);

        const stats = me._enemyCatcher.getStat();
        for (let i = 0; i < stats.length; ++i) {
            const item = me._enemies[i];
            const total = i === Enums.EnemyType.SQUARE 
                ? Config.Start.Squares.length
                    : i === Enums.EnemyType.CIRCLE
                        ? Config.Start.Circles.length
                        : Config.Start.Triangles.length;

            if (stats[i] >= total) {
                item.text.setVisible(false);
                item.complete.setVisible(true);
            } else {
                item.text.setText(`${stats[i]}/${total}`);
            }
        }
    }
}