import Phaser from '../lib/phaser.js';

import Config from './Config.js';
import Consts from './Consts.js';
import Enums from './Enums.js';
import Utils from './Utils.js';

export default class Player {

    /** @type {Bills[]} */
    _money;

    /** @type {Phaser.GameObjects.Image} */
    _buyButton;

    /** @type {Object[]} */
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

        me._money = [];
        for (let i = 0; i < Consts.BillCount; ++i) {

            const origin = new Phaser.Geom.Point(-860 + i * shift, 1250);
            const point = Phaser.Math.RotateAround(origin, 0, 0, sideAngle);

            const bills = {
                count: money[i],
                image: factory.image(point.x, point.y, 'money', i)
                    .setAngle(billAngle)
                    .setVisible(money[i] > 0)
            };

            me._money.push(bills);
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

        for (let i = 0; i < me._money.length; ++i) {

            const contains = Phaser.Geom.Rectangle.ContainsPoint(
                me._money[i].image.getBounds(),
                point
            )

            if (contains && me._money[i].count > 0) {
                me._money[i].count -= 1;
                me._money[i].image.setVisible(
                    me._money[i].count > 0);

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
            me._money[i].count += money[i];
            me._money[i].image.setVisible(
                me._money[i].count > 0);
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

        me._fields.push({
            index: field,
            houses: [],
            hotel: null
        });
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

    /**
     * @returns {Number}
     */
    getTotalMoney() {
        const me = this;

        return Utils.getTotalMoney(me._enumBills());
    }

    /**
     * @param {Number} cost 
     * @returns {Phaser.Geom.Point}
     */
    getNextOptimalBillPosition(cost) {
        const me = this;

        const counts = Utils.getBillCount(me._enumBills(), cost);
        for (let i = counts.length - 1; i >= 0; --i)
            if (counts[i] > 0) {
                const bill = me._money[i].image;
                return new Phaser.Geom.Point(bill.x, bill.y);
            }

        throw `can't find bill to pay ${cost}`;
    }

    /**
     * @returns {Phaser.Geom.Point}
     */
    getBuyButtonPosition() {
        const me = this;

        return new Phaser.Geom.Point(me._buyButton.x, me._buyButton.y);
    }

    /**
     * @param {Number} field 
     * @returns {Number}
     */
    getRent(field) {
        const me = this;

        const config = Config.Fields[field];
        const property = Utils.firstOrDefault(me._fields, (f) => f.index == field);
        if (!property)
            throw `Player hasn't field ${field}`;

        if (!!property.hotel)
            return config.rent[Enums.PropertyRentIndex.HOTEL];

        if (property.houses.length > 0)
            return config.rent[Enums.PropertyRentIndex.COLOR + property.houses.length];

        const color = config.color;
        const sameColorFieldsCount = me._fields
            .map((f) => f.index)
            .filter((i) => Config.Fields[i].color == color)
            .length;

        const colorStr = Utils.enumToString(Enums.FieldColorIndex, color);
        if (sameColorFieldsCount == Consts.PropertyColorCounts[colorStr])
            return config.rent[Enums.PropertyRentIndex.COLOR];
        
        return config.rent[Enums.PropertyRentIndex.BASE];
    }

    _enumBills() {
        const me = this;

        return me._money.map((x) => x.count);
    }
}