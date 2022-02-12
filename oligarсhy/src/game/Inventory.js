import Phaser from '../lib/phaser.js';

import Config from './Config.js';
import Consts from './Consts.js';
import Utils from './Utils.js';

export default class Inventory {

    /** @type {Bills[]} */
    _bills;

    /** @type {Phaser.GameObjects.Image} */
    _buyButton;

    /** @type {Number[]} */
    _fields;

    /**
     * @param {Phaser.GameObjects.GameObjectFactory} factory 
     * @param {Number} player
     * @param {Number[]} money
     */
    constructor(factory, player, money) {
        const me = this;

        const shift = Consts.BillSize.Height  + 25;

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

        const butttonPoint = Phaser.Math.RotateAround(
            new Phaser.Geom.Point(0, 450), 0, 0, sideAngle);
        me._buyButton = factory.image(butttonPoint.x, butttonPoint.y, 'buttons', 0)
            .setAngle(Utils.getAngle(player));
            
        me._fields = [];
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

    /**
     * @param {Phaser.Geom.Point} point 
     */
    isButtonClick(point) {
        const me = this;

        return Phaser.Geom.Rectangle.ContainsPoint(
            me._buyButton.getBounds(),
            point);
    }

    /**
     * @param {Number} field 
     */
    addProperty(field) {
        const me = this;

        me._fields.push(field);
        console.log(`player buys property ${field}!`);
    }

    /**
     * @param {Number} field 
     * @returns {Boolean}
     */
    hasField(field) {
        const me = this;

        return Utils.any(me._fields, (f) => f == field);
    }

    /**
     * @param {Boolean} isCurrentPlayer 
     */
    startTurn(isCurrentPlayer) {
        const me = this;

        me._buyButton.setVisible(isCurrentPlayer);
    }
}