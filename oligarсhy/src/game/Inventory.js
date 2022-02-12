import Phaser from '../lib/phaser.js';

import Consts from './Consts.js';
import Enums from './Enums.js';
import Utils from './Utils.js';

export default class Inventory {

    /** @type {Bills[]} */
    _bills;

    /**
     * @param {Phaser.GameObjects.GameObjectFactory} factory 
     * @param {Number} player
     * @param {Number[]} money
     */
    constructor(factory, player, money) {
        const me = this;

        const shift = Consts.MoneySize.Height  + 25;

        const billAngle = Utils.getAngle(player, true);
        const sideAngle = Phaser.Math.DegToRad(
            Utils.getAngle(player));

        me._bills = [];
        for (let i = 0; i < Consts.BillCount; ++i) {

            const origin = new Phaser.Geom.Point(-860 + i * shift, 1250);
            const point = Phaser.Math.RotateAround(origin, 0, 0, sideAngle);

            const bills = {
                count: money[i],
                image: factory.image(point.x, point.y, 'money', i)
                    .setAngle(billAngle)
                    .setVisible(money[i] > 0)
            };

            me._bills.push(bills);
        }
    }

    /**
     * @param {Phaser.Geom.Point} point 
     * @returns {Number}
     */
    findBillOnPoint(point) {
        const me = this;

        for (let i = 0; i < me._bills.length; ++i) {

            const contains = Phaser.Geom.Rectangle.ContainsPoint(
                me._bills[i].image.getBounds(),
                point
            )

            if (contains && me._bills[i].count > 0) {
                me._bills[i].count -= 1;
                me._bills[i].image.setVisible(
                    me._bills[i].count > 0);

                return i;
            }
        }

        return -1;
    }

    /**
     * @param {Number[]} money 
     */
    addMoney(money) {
        const me = this;

        for (let i = 0; i < money.length; ++i) {
            me._bills[i].count += money[i];
            me._bills[i].image.setVisible(
                me._bills[i].count > 0);
        }
    }
}