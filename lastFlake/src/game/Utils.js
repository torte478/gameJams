import Consts from "../game/Consts.js";

export default class Utils {

    /**
     * @param {Array} arr 
     * @param {Function} predicate 
     * @returns {any}
     */
    static firstOrDefault(arr, predicate) {
        for (let i = 0; i < arr.length; ++i) {
            if (!!predicate(arr[i])) {
                return arr[i];
            }
        }

        return null;
    }

    static getYbyLevel(level) {
        return level == Consts.levelType.TOP
            ? Consts.height.top
            : level == Consts.levelType.MIDDLE
                ? Consts.height.middle
                : Consts.height.floor;
    }
}