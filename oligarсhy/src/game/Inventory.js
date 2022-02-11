import Phaser from '../lib/phaser.js';

import Consts from './Consts.js';
import Enums from './Enums.js';
import Utils from './Utils.js';

export default class Inventory {

    /**
     * @param {Phaser.GameObjects.GameObjectFactory} factory 
     * @param {Number} player
     */
    constructor(factory, player) {
        const me = this;

        const shift = Consts.MoneySize.Height  + 25;

        const billAngle = Utils.getAngle(player, true);
        const sideAngle = Phaser.Math.DegToRad(
            Utils.getAngle(player));

        let i = 0;
        for (let item in Enums.Money) {

            const origin = new Phaser.Geom.Point(-860 + i * shift, 1250);
            const point = Phaser.Math.RotateAround(origin, 0, 0, sideAngle);

            const obj = factory.image(point.x, point.y, 'money', Enums.Money[item])
                .setAngle(billAngle);

            ++i;
        }
    }
}