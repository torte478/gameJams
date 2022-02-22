import Config from "./Config.js";
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

    // =============== Custom =====

    /**
     * @param {Phaser.Geom.Rectangle} bounds 
     * @param {Phaser.Tilemaps.Tilemap} level
     * @returns {Boolean}
     */
    static isTileFree(bounds, level) {

        const x = Math.floor(bounds.x / Consts.Unit.Small);
        const y = Math.floor(bounds.y / Consts.Unit.Small);

        const widthMod = bounds.x % Consts.Unit.Small > 4 ? 1 : 0;
        const heghtMod = bounds.y % Consts.Unit.Small > 4 ? 1 : 0;

        const width = Math.floor(bounds.width / Consts.Unit.Small) + widthMod;
        const height = Math.floor(bounds.height / Consts.Unit.Small) + heghtMod;

        const tiles = level.findTile(() => true, this, x, y, width, height, { 
            isColliding: true });

        return !tiles;
    }
}