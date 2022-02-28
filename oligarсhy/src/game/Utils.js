import Config from "./Config.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";

// TODO : split to general Utils and Game Utils
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
     * @returns {Object}
     */
    static firstOrDefault(array, f) {
        for (let i = 0; i < array.length; ++i) {
            if (!!f(array[i])) {
                return array[i];
            }
        }

        return null;
    }

    /**
     * @param {Array} array 
     * @param {Function} f 
     * @returns {Number}
     */
     static firstOrDefaultIndex(array, f) {
        for (let i = 0; i < array.length; ++i) {
            if (!!f(array[i])) {
                return i;
            }
        }

        return null;
    }

    /**
     * @param {Array} array 
     * @param {Function} f 
     * @returns {Object}
     */
    static single(array, f) {
        let result;

        for (let i = 0; i < array.length; ++i) {
            if (!!f(array[i])) {
                if (!!result)
                    throw 'array contains more that single occurrence';

                result = array[i];
            }
        }

        if (!result)
            throw 'array not contains single occurrence';

        return result;
    }

    /**
     * @param {Array} array 
     * @param {Object} elem 
     * @returns {Boolean}
     */
    static contains(array, elem) {
        for (let i = 0; i < array.length; ++i)
            if (array[i] === elem)
                return true;

        return false;
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
    static valueToBills(money, value) {

        if (Utils.getTotalMoney(money) < value)
            throw `not enough money for pay ${value}`;

        const result = Utils.buildArray(Consts.BillCount, 0);

        const temp = [];
        for (let i = 0; i < money.length; ++i)
            temp.push(money[i]);

        let i = result.length - 1;
        while (value > 0 && i >= 0) {

            while (temp[i] == 0)
                i -= 1; //TODO : fix all occurrences (--i)

            result[i] += 1;
            temp[i] -= 1;
            value -= Consts.BillValue[i];
        }

        return result;
    }

    /**
     * @param {Number} value 
     * @returns {Number[]}
     */
     static splitValueToBills(value) {
        const result = Utils.buildArray(Consts.BillCount, 0);

        let i = result.length - 1;
        while (value > 0) {

            while (value < Consts.BillValue[i])
                i -= 1;

            result[i] += 1;
            value -= Consts.BillValue[i];
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

    /**
     * @param {String} msg 
     */
    static debugLog(msg) {
        if (Config.DebugLog)
            console.log(msg);
    }

    static GetRandom(from, to, debug) {
        return debug !== undefined && Config.DebugRandom
            ? debug
            : Phaser.Math.Between(from, to);
    }
}