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
}