import Phaser from '../../lib/phaser.js';

import Buttons from './Buttons.js';
import Consts from '../Consts.js';
import Enums from '../Enums.js';
import Helper from '../Helper.js';
import Utils from '../Utils.js';
import FieldInfo from '../FieldInfo.js';
import HousePool from './HousePool.js';

export default class Player {

    /** @type {Object[]} */
    _bills;

    /** @type {Buttons} */
    _buttons;

    /** @type {Object[]} */
    _fields;

    /** @type {HousePool} */
    _housePool;

    /** @type {Boolean} */
    _alive;

    /** @type {Number} */
    index;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Number} index
     * @param {Number[]} bills
     * @param {HousePool} housePool
     */
    constructor(scene, index, bills, housePool) {
        const me = this;

        const factory = scene.add;

        me.index = index;

        me._bills = me._createStartBills(factory, bills, index);
        me._buttons = new Buttons(scene, index);

        me._housePool = housePool;
        me._fields = [];

        me._alive = true;
    }

    /**
     * @param {Phaser.Geom.Point} point 
     * @returns {Number}
     */
    findBillIndexOnPoint(point) {
        const me = this;

        for (let i = 0; i < me._bills.length; ++i) {

            const contains = Phaser.Geom.Rectangle.ContainsPoint(
                me._bills[i].image.getBounds(),
                point
            )

            if (contains && me._bills[i].count > 0) 
                return i;
        }

        return -1;
    }

    /**
     * @param {Number} index 
     */
    removeBill(index) {
        const me = this;

        --me._bills[index].count;
        me._bills[index].image.setVisible(
            me._bills[index].count > 0);
    }

    /**
     * @param {Number[]} bills 
     */
    addBills(bills) {
        const me = this;

        for (let i = 0; i < bills.length; ++i) {
            me._bills[i].count += bills[i];
            me._bills[i].image.setVisible(me._bills[i].count > 0);
        }
    }

    /**
     * @param {Phaser.Geom.Point} point 
     * @param {Number}
     */
    canClickButton(point, type) {
        const me = this;

        const result = me._buttons.findVisibleIndex(point);
        if (result == null)
            return false;

        return result == type;
    }

    /**
     * @param {Number} field 
     */
    addField(field) {
        const me = this;

        me._fields.push({
            index: field,
            houses: [],
            hotel: null
        });

        Utils.debugLog(`player ${Utils.enumToString(Enums.Player, me.index)} buys property ${field}!`);

        return me.getCardGrid();
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
     * @param {Number} field 
     * @returns {Boolean}
     */
    hasHouse(field) {
        const me = this;

        return Utils.any(
            me._fields, 
            (f) => f.index == field 
                   && (f.houses != null && f.houses.length > 0
                        || f.hotel != null));
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

        if (!me._alive)
            return 0;

        return me.getBillsMoney() + me.getFieldsCost();
    }

    /**
     * @returns {Number}
     */
    getFieldsCost() {
        const me = this;

        if (!me._alive)
            return 0;

        let result = 0;
        for (let i = 0; i < me._fields.length; ++i)
            result += me._getFieldCost(i);            

        return result;
    }

    /**
     * @returns {Number}
     */
    getBillsMoney() {
        const me = this;

        if (!me._alive)
            return 0;

        return Helper.getTotalMoney(me.enumBills());
    }

    /**
     * @param {Number} index 
     * @returns {Phaser.Geom.Point}
     */
    getBillPosition(index) {
        const me = this;

        return Utils.toPoint(me._bills[index].image);
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
     * @param {Number} dices
     * @returns {Number}
     */
    getRent(field, dices) {
        const me = this;

        const config = FieldInfo.Config[field];
        if (!Utils.contains(Consts.BuyableFieldTypes, config.type))
            throw `Field hasn't rent`;

        if (config.type == Enums.FieldType.UTILITY)
            return me._getUtilityRent(config, dices);

        const property = Utils.firstOrDefault(me._fields, (f) => f.index == field);
        if (!property)
            throw `Player hasn't field ${field}`;

        if (!!property.hotel)
            return config.rent[Enums.PropertyRentIndex.HOTEL];

        if (property.houses.length > 0)
            return config.rent[Enums.PropertyRentIndex.COLOR + property.houses.length];

        return me._getPropertyColorRent(config);
    }

    /**
     * @param {Number} index 
     * @param {Phaser.Geom.Point} fieldPos
     * @returns {Number}
     */
    trySell(index, fieldPos) {
        const me = this;

        const field = Utils.single(me._fields, (f) => f.index == index);
        const config = FieldInfo.Config[index];
    
        if (!!field.hotel) 
            return this._sellHotel(field, config, fieldPos);

        const sameColorFields = me._fields
            .filter((f) => FieldInfo.Config[f.index].color == config.color);

        if (field.houses.length > 0)
            return me._sellHouse(field, config, sameColorFields);

        return me._sellField(index, config);
    }

    /**
     * @param {Number} index 
     * @returns {Boolean}
     */
    canSellSmth(index) {
        const me = this;

        const field = Utils.single(me._fields, (f) => f.index == index);
        const config = FieldInfo.Config[index];

        const sameColorFields = me._fields
            .filter((f) => FieldInfo.Config[f.index].color == config.color);

        if (!!field.hotel) 
            return Enums.ActionType.SELL_HOUSE;
            
        const canSellHouse = field.houses.length > 0
            && !Utils.any(sameColorFields, 
                    (f) => f.houses.length > field.houses.length 
                        || !!f.hotel)
        if (canSellHouse)
            return Enums.ActionType.SELL_HOUSE;
          
        const canSellField = !Utils.any(sameColorFields, (f) => f.houses.length > 0);
        return canSellField
            ? Enums.ActionType.SELL_FIELD
            : null;
    }

    /**
     * @param {Number} index 
     * @returns {Number}
     */
    canBuyHouse(index) {
        const me = this;

        if (FieldInfo.Config[index].type != Enums.FieldType.PROPERTY)
            return false;

        const field = me._getProperty(index);

        if (field.hotel != null)
            return false;

        const color = FieldInfo.Config[field.index].color;
        const sameColorFields = me._fields
            .filter((f) => FieldInfo.Config[f.index].color == color);

        const colorStr = Utils.enumToString(Enums.FieldColorIndex, color);
        if (sameColorFields.length != Consts.PropertyColorCounts[colorStr])
            return false;

        if (field.houses.length == Consts.MaxHouseCount)
            return Utils.all(sameColorFields, (f) => f.houses.length == Consts.MaxHouseCount || f.hotel != null);
        else
            return Utils.all(sameColorFields, (f) => f.houses.length >= field.houses.length);
    }

    /**
     * @param {Number} index
     * @param {Phaser.Geom.Point[]} positions
     */
    addBuilding(index, pos) {
        const me = this;

        const count = me._getHouseCount(index);
        const positions = me._getHousePositions(index, count, pos);

        const field = me._getProperty(index);
        if (!field)
            throw `can't find property with index ${index}`;

        const angle = Helper.getFieldAngle(index);

        if (field.houses.length >= Consts.MaxHouseCount) 
            me._addHotel(field, positions);
        else 
            me._addHouse(field, positions);
    }

    /**
     * @param {Number} type 
     */
    hideButton(type) {
        const me = this;

        me._buttons.hide(type);
    }

    /**
     * @returns {Number}
     */
    getRichestFieldIndex() {
        const me = this;

        let result = [ me._fields[0].index ];
        let max = me._getCost(result[0]);

        for (let i = 1; i < me._fields.length; ++i) {
            const index = me._fields[i].index;
            const cost = me._getCost(index);

            if (cost > max) {
                result = [ index ];
                max = cost;
            }
            else if (cost == max)
                result.push(index);
        }

        if (result.length == 0)
            throw `can't sell anything`;

        return Utils.getRandomEl(result);
    }

    /**
     * 
     * @param {Phaser.Geom.Point} point 
     */
    updateButtonSelection(point) {
        const me = this;

        me._buttons.updateButtonSelection(point);
    }

    /**
     * @returns {Number[][]}
     */
    getCardGrid() {
        const me = this;

        const grid = Utils.buildArray(10, -1);
        for (let i = 0; i < me._fields.length; ++i) {
            let column = -1;
            const config = FieldInfo.Config[me._fields[i].index];

            if (config.type == Enums.FieldType.PROPERTY)
                column = config.color - 1;
            else if (config.type == Enums.FieldType.RAILSTATION)
                column = 8;
            else 
                column = 9;

            if (grid[column] == -1)
                grid[column] = [ me._fields[i].index ];
            else
                grid[column].push(me._fields[i].index);
        }

        const result = [];
        for (let i = 0; i < grid.length; ++i)
            if (grid[i] != -1)
                result.push(grid[i]);

        return result;
    }

    /**
     */
    kill() {
        const me = this;

        me._alive = false;
        for (let i = 0; i < me._bills.length; ++i)
            me._bills[i].image.setVisible(false);

        for (let i = 0; i < me._fields.length; ++i) {
            const field = me._fields[i];

            if (!!field.hotel)
                me._housePool.remove(field.hotel);
                
            for (let j = 0; j < field.houses.length; ++j)
                me._housePool.remove(field.houses[j]);
        }

        me._fields = [];
    }

    /**
     * @returns {Number[]}
     */
    enumBills() {
        const me = this;

        return me._bills.map((x) => x.count);
    }

    _getCost(index) {
        const me = this;

        const config = FieldInfo.Config[index];
        if (config.type == Enums.FieldType.PROPERTY) {
            const field = Utils.single(me._fields, (f) => f.index == index);

            if (!!field.hotel || field.houses.length > 0)
                return me.canSellSmth(index)
                    ? config.costHouse / 2
                    : 0;
        }
        
        return config.cost / 2;
    }

    /**
     * @param {Number} index 
     * @returns {Number}
     */
    _getHouseCount(index) {
        const me = this;

        const field = me._getProperty(index);

        if (!field || field.houses.length == 4)
            return 0;

        return field.houses.length;
    }

    /**
     * @param {Number} index 
     * @param {Number} existingHouseCount 
     * @param {Phaser.Geom.Point} fieldPos
     * @returns {Phaser.Geom.Point[]}
     */
     _getHousePositions(index, existingHouseCount, fieldPos) {
        const me = this;

        const total = (existingHouseCount + 1) * 50;
        const start = -total / 2 + 25;

        const positions = [];
        for (let i = 0; i < existingHouseCount + 1; ++i) {
            const point = new Phaser.Geom.Point(
                fieldPos.x + start + 50 * i,
                fieldPos.y - 95
            );
    
            const angle = Helper.getFieldAngle(index);
    
            const result = Phaser.Math.RotateAround(
                point,
                fieldPos.x,
                fieldPos.y,
                Phaser.Math.DegToRad(angle)
            );

            positions.push(result);
        }

        return positions;
    }

    _getProperty(index) {
        const me = this;

        const field = Utils.firstOrDefault(me._fields, (f) => f.index == index);
        if (!field)
            return null;

        if (FieldInfo.Config[field.index].type != Enums.FieldType.PROPERTY)
            return null;

        return field;
    }

    _createStartBills(factory, money, index) {
        const shift = Consts.Sizes.Bill.Height  + 25;

        const billAngle = Helper.getAngle(index, true);
        const sideAngle = Phaser.Math.DegToRad(
            Helper.getAngle(index));

        const result = [];
        for (let i = 0; i < Consts.BillCount; ++i) {

            const origin = new Phaser.Geom.Point(-860 + i * shift, 1250);
            const point = Phaser.Math.RotateAround(origin, 0, 0, sideAngle);

            const bills = {
                count: money[i],
                image: factory.image(point.x, point.y, 'money', i * 2)
                    .setAngle(billAngle)
                    .setVisible(money[i] > 0)
                    .setDepth(Consts.Depth.Money)
            };

            result.push(bills);
        }

        return result;
    }

    _getFieldCost(index) {
        const me = this;

        const field = me._fields[index];
        const config = FieldInfo.Config[field.index];
        
        let cost = config.cost / 2;

        if (config.type != Enums.FieldType.PROPERTY) 
            return cost;

        if (!!field.hotel)
            cost += 5 * (config.costHouse / 2);
        else 
            cost += field.houses.length * (config.costHouse / 2);

        return cost;
    }

    _getPropertyColorRent(config) {
        const me = this;

        const color = config.color;
        const sameColorFieldsCount = me._fields
            .map((f) => f.index)
            .filter((i) => FieldInfo.Config[i].color == color)
            .length;

        const colorStr = Utils.enumToString(Enums.FieldColorIndex, color);
        if (sameColorFieldsCount == Consts.PropertyColorCounts[colorStr])
            return config.rent[Enums.PropertyRentIndex.COLOR];
        
        return config.rent[Enums.PropertyRentIndex.BASE];
    }

    _getUtilityRent(config, dices) {
        const me = this;

        const utilities = me._fields
            .filter((f) => FieldInfo.Config[f.index].type == Enums.FieldType.UTILITY)
            .length;

        return config.rent[utilities - 1] * dices;
    }

    _sellField(index, config) {
        const me = this;

        if (Utils.any(sameColorFields, (f) => f.houses.length > 0))
            throw "can't sell - to many houses";

        me._fields = me._fields.filter((f) => f.index != index);
        return config.cost / 2    
    }

    _sellHouse(field, config, sameColorFields) {
        const me = this;

        const count = field.houses.length;
        if (Utils.any(sameColorFields, (f) => f.houses.length > count || !!f.hotel))
            throw "can't sell - to many houses";

        for (let i = 0; i < field.houses.length; ++i)
            me._housePool.remove(field.houses[i]);

        field.houses = [];
        for (let i = 0; i < count - 1; ++i)
            me.addBuilding(field.index, fieldPos);

        return config.costHouse / 2;
    }

    _sellHotel(field, config, fieldPos) {
        const me = this;

        const config = FieldInfo.Config[field.index];

        me._housePool.remove(field.hotel);
        field.hotel = null;

        for (let i = 0; i < Consts.MaxHouseCount; ++i)
            me.addBuilding(field.index, fieldPos);

        return config.costHouse / 2;
    }

    _addHouse(field, positions) {
        const me = this;

        const house = me._housePool.createHouse()
            .setAngle(angle);

        field.houses.push(house);

        for (let i = 0; i < positions.length; ++i)
            field.houses[i].setPosition(positions[i].x, positions[i].y);
    }

    _addHotel(field, positions) {
        const me = this;

        for (let i = 0; i < field.houses.length; ++i)
            me._housePool.remove(field.houses[i]);

        field.houses = [];

        field.hotel = me._housePool.createHotel()
            .setAngle(angle)
            .setPosition(positions[0].x, positions[0].y);
    }
}