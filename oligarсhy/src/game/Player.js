import Phaser from '../lib/phaser.js';

import Buttons from './Buttons.js';
import Config from './Config.js';
import Consts from './Consts.js';
import Enums from './Enums.js';
import Groups from './Groups.js';
import Utils from './Utils.js';

export default class Player {

    /** @type {Bills[]} */
    _money;

    /** @type {Buttons} */
    _buttons;

    /** @type {Object[]} */
    _fields;

    /** @type {Groups} */
    _groups;

    /** @type {Number} */
    index;

    /**
     * @param {Phaser.GameObjects.GameObjectFactory} factory 
     * @param {Number} index
     * @param {Number[]} money
     * @param {Array} fields
     * @param {Groups} groups
     */
    constructor(factory, index, money, fields, groups) {
        const me = this;

        me.index = index;

        const shift = Consts.Sizes.Bill.Height  + 25;

        const billAngle = Utils.getAngle(index, true);
        const sideAngle = Phaser.Math.DegToRad(
            Utils.getAngle(index));

        // TODO: refactor
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

        me._buttons = new Buttons(factory, index);

        me._groups = groups;
        me._fields = me._buildFields(fields);
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
     * @param {Number}
     */
    isButtonClick(point, type) {
        const me = this;

        const result = me._buttons.checkClick(point);
        if (result == null)
            return false;

        return result == type;
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
        console.log(`player ${Utils.enumToString(Enums.PlayerIndex, me.index)} buys property ${field}!`);
    }

    /**
     * @param {Number} field 
     * @returns {Boolean}
     */
    hasField(field) {
        const me = this;

        return Utils.any(me._fields, (f) => f.index == field);
    }

    /**
     * @param {Number[]} types
     * @param {Boolean}
     */
    showButtons(types, add) {
        const me = this;

        me._buttons.show(types, add);
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

        const counts = Utils.valueToBills(me._enumBills(), cost);
        for (let i = counts.length - 1; i >= 0; --i)
            if (counts[i] > 0) {
                const bill = me._money[i].image;
                return new Phaser.Geom.Point(bill.x, bill.y);
            }

        throw `can't find bill to pay ${cost}`;
    }

    /**
     * @param {Number} type
     * @returns {Phaser.Geom.Point}
     */
    getButtonPosition(type) {
        const me = this;

        return me._buttons.getButtonPosition(type);
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

    /**
     * @param {Number} index 
     */
    removeProperty(index) {
        const me = this;

        me._fields = me._fields.filter((f) => f.index != index);
    }

    /**
     * @param {Number} index 
     * @returns {Number}
     */
    getBuyAction(index) {
        const me = this;

        const field = me._getProperty(index);

        if (field.hotel != null)
            return null;

        const color = Config.Fields[field.index].color;
        const sameColorFields = me._fields
            .filter((f) => Config.Fields[f.index].color == color);

        const colorStr = Utils.enumToString(Enums.FieldColorIndex, color);
        if (sameColorFields.length != Consts.PropertyColorCounts[colorStr])
            return null;

        // TODO: limitations
        if (field.houses.length == 4)
            return Utils.all(sameColorFields, (f) => f.houses.length == 4 || f.hotel != null)
                ? Enums.ButtonType.BUY_HOTEL
                : null;
        else
            return Utils.all(sameColorFields, (f) => f.houses.length >= field.houses.length)
                ? Enums.ButtonType.BUY_HOUSE
                : null;
    }

    /**
     * @param {Number} index
     * @param {Phaser.Geom.Point[]} positions
     */
    addHouse(index, positions) {
        const me = this;

        const field = me._getProperty(index);
        if (!field)
            throw `can't find property with index ${index}`;

        // TODO : to Utils (+ duplicate from Fields)
        const quotient = field.index / (Consts.FieldCount / 4);
        const angle = Utils.getAngle(Math.floor(quotient));

        if (field.houses.length >= 4) {
            for (let i = 0; i < field.houses.length; ++i)
                me._groups.kill(field.houses[i]);

            field.houses = [];

            field.hotel = me._groups.createHotel()
                .setAngle(angle)
                .setPosition(positions[0].x, positions[0].y);
        }
        else {
            const house = me._groups.createHouse()
                .setAngle(angle);
            field.houses.push(house);
            for (let i = 0; i < positions.length; ++i)
                field.houses[i].setPosition(positions[i].x, positions[i].y);
        }
    }

    /**
     * @param {Number} index 
     * @returns {Number}
     */
    getHouseCount(index) {
        const me = this;

        const field = me._getProperty(index);

        if (!field || field.houses.length == 4)
            return 0;

        return field.houses.length;
    }

    _getProperty(index) {
        const me = this;

        const field = Utils.firstOrDefault(me._fields, (f) => f.index == index);
        if (!field)
            return null;

        if (Config.Fields[field.index].type != Enums.FieldType.PROPERTY)
            return null;

        return field;
    }

    _enumBills() {
        const me = this;

        return me._money.map((x) => x.count);
    }

    /**
     * @param {Array} fields 
     */
    _buildFields(fields) {
        const me = this;

        const result = [];

        for (let i = 0; i < fields.length; ++i) {
            const item = fields[i];

            if (isNaN(item)) 
                result.push(item);
            else
                result.push({
                    index: item,
                    houses: [],
                    hotel: null
                });
        }
        
        return result;
    }
}