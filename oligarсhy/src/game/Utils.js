import Consts from "./Consts.js";

export default class Utils {

    /**
     * @param {Array} array 
     * @param {Function} f 
     */
    static all(array, f) {
        for (let i = 0; i < array.length; ++i) {
            if (!f(array[i]))
                return false;
        }

        return true;
    }

    /**
     * @param {Array} array 
     * @param {Function} f 
     */
     static any(array, f) {
        for (let i = 0; i < array.length; ++i) {
            if (!!f(array[i]))
                return true;
        }

        return false;
    }

    /**
     * @param {Object} enumObj 
     * @param {Number} value 
     */
    static enumToString(enumObj, value) {
        for (let name in enumObj) {
            if (enumObj[name] == value)
                return name;
        }

        return `UNDEFINED (${value})`;
    }

    /**
     * @param {Number} side 
     * @param {Boolean} vertical
     * @returns {Number}
     */
    static getAngle(side, vertical) {

        const index = vertical
            ? (side + 1) % 4
            : side;

        switch (index) {
            case 0:
                return 0;

            case 1:
                return 90;

            case 2:
                return 180;

            case 3: 
                return 270;

            default:
                throw `can't calculate angle for side ${side}`;
        }
    }

    /**
     * @param {Array} array 
     * @param {Function} f 
     */
    static firstOrDefault(array, f) {
        for (let x in array) {
            if (!!f(x)) {
                return x;
            }
        }

        return null;
    }

    /**
     * @param {Number[]} money 
     */
    static getTotalMoney(money) {
        let result = 0;

        for (let i = 0; i < money.length; ++i)
            result += money[i] * Consts.BillValue[i];

        return result;
    }

    /**
     * @param {Number[]} money 
     * @param {Number} value 
     */
    static getMoneyDiff(money, value) {
        const result = Utils.buildArray(Consts.BillCount, 0);
        let diff = Utils.getTotalMoney(money) - value;

        let i = result.length - 1;
        while (diff > 0) {

            while (diff < Consts.BillValue[i])
                i -= 1;

            result[i] += 1;
            diff -= Consts.BillValue[i];
        }

        return result;
    }

    /**
     * @param {Number} length 
     * @param {Object} value 
     * @returns {Object[]}
     */
    static buildArray(length, value) {
        const result = [];

        for (let i = 0; i < length; ++i)
            result.push(value);

        return result;
    }
}