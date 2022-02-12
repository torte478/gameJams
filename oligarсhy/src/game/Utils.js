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
     * @param {Object} enumObj 
     * @param {Number} value 
     */
    static enumToString(enumObj, value) {
        for (let name in enumObj) {
            if (enumObj[name] == value)
                return name;
        }

        return 'UNDEFINED';
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
}