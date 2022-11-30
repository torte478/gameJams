import Config from "../Config.js";

export default class Utils {

    // --- Collections ---

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
     * @param {Array} array 
     * @param {Function} f 
     * @returns {Object}
     */
    static firstOrNull(array, f) {
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
     static lastOrNull(array, f) {
        for (let i = array.length - 1; i >= 0; --i) {
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
     static lastIndexOrNull(array, f) {
        for (let i = array.length - 1; i >= 0; --i) {
            if (!!f(array[i])) {
                return i;
            }
        }

        return null;
    }

    /**
     * @param {Array} array 
     * @param {Function} f 
     * @returns {Number}
     */
     static firstIndexOrNull(array, f) {
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
     * @param {Array} source 
     * @returns {Array}
     */
    static copyArray(source) {
        const result = [];

        for (let i = 0; i < source.length; ++i)
            result.push(source[i]);

        return result;
    }

    /**
     * @param {Array} array 
     * @param {Number} index 
     * @returns {Array}
     */
    static removeAt(array, index) {
        const result = [];
        for (let i = 0; i < array.length; ++i)
            if (i != index)
                result.push(array[i]);
        return result;
    }

    // --- Matrix ---

    /**
     * @param {any[][]} arr 
     * @param {Number} index 
     * @returns {Object}
     */
     static toMatrixIndex(arr, index) {
        const height = arr.length;
        const width = arr[0].length;

        return { i: Math.floor(index / height), j: index % width };
    }

    /**
     * 
     * @param {any[][]} arr 
     * @param {Number} i 
     * @param {Number} j 
     * @returns {Number}
     */
    static fromMatrix(arr, i, j) {
        const height = arr.length;
        return i * height + j;
    }

    /**
     * 
     * @param {any[][]} arr 
     * @param {Number} i 
     * @param {Number} j 
     * @returns {Object[]}
     */
    static getNeighbours(arr, i, j) {
        const result = [];
        for (let y = -1; y <= 1; ++y)
            for (let x = -1; x <= 1; ++x) {
                const nextI = i + y;
                const nextJ = j + x;

                if (nextI == i && nextJ == j)
                    continue;

                if (nextI < 0 || nextI >= arr.length)
                    continue;

                if (nextJ < 0 || nextJ >= arr[nextI].length)
                    continue;

                result.push({ i: nextI, j: nextJ });
            }

        return result;
    }

    // --- Geometry ---

    /**
     * @param {Number} x 
     * @param {Number} y 
     * @returns {Phaser.Geom.Point}
     */
    static buildPoint(x, y) {
        return new Phaser.Geom.Point(x, y);
    }

    /**
     * @param {Object} obj 
     * @returns {Phaser.Geom.Point}
     */
    static toPoint(obj) {
        if (obj.x == undefined)
            throw 'obj is not contains property X';

        if (obj.y == undefined)
            throw 'obj is not contains property Y';

        return new Phaser.Geom.Point(obj.x, obj.y);
    }

    // --- Random ---

    /**
     * @param {Object[]} arr 
     * @returns {Object}
     */
    static getRandomEl(arr) {
        const index = Phaser.Math.Between(0, arr.length - 1);
        return arr[index];
    }

    /**
     * @param {Number} from 
     * @param {Number} to 
     * @param {Number} debug 
     * @returns {Number}
     */
    static getRandom(from, to, debug) {
        return debug !== undefined && Config.Debug.Global && Config.Debug.Random
            ? debug
            : Phaser.Math.Between(from, to);
    }

    /**
     * @param {Array} array 
     * @param {Number} count 
     * @returns {Array}
     */
     static getRandomElems(array, count) {
        if (count > array.length)
            throw `invalid count: ${count}`;

        const result = [];
        let arr = Utils.copyArray(array);
        while (result.length < count) {
            const index = Phaser.Math.Between(0, arr.length - 1);
            result.push(arr[index]);
            arr = Utils.removeAt(arr, index);
        }

        return result;
    }
    
    /**
     * @param {Array} array 
     * @returns {Array}
     */
    static shuffle(array) {
        return Utils.getRandomElems(array, array.length);
    }

    // --- Start loading ---

    /**
     * @param {Phaser.Scene} scene 
     * @param {String} name 
     * @param {Number} width 
     * @param {Number} height 
     */
    static loadSpriteSheet(scene, name, width, height) {
        return scene.load.spritesheet(name, `assets/${name}.png`, {
            frameWidth: width,
            frameHeight: !!height ? height : width
        });
    }

    /**
     * @param {Phaser.Scene} scene 
     * @param {String} name 
     */
    static loadImage(scene, name) {
        return scene.load.image(name, `assets/${name}.png`);
    }

    /**
     * @param {Phaser.Scene} scene 
     * @param {String} name 
     * @returns 
     */
    static loadWav(scene, name) {
        return scene.load.audio(name, `assets/${name}.wav`);
    }

    /**
     * @param {Phaser.Scene} scene 
     * @param {String} name 
     * @returns 
     */
    static loadMp3(scene, name) {
        return scene.load.audio(name, `assets/${name}.mp3`);
    }

    // --- Debug ---

    /**
     * @param {Boolean} flag 
     * @param {Function} func 
     * @returns {Boolean}
     */
    static ifDebug(flag, func) {
        if (Utils.isDebug(flag))
            return func();

        return false;
    }

    /**
     * @param {Boolean} flag 
     * @returns {Boolean}
     */
    static isDebug(flag) {
        return Config.Debug.Global && flag;
    }

    /**
     * @param {String} msg 
     */
    static debugLog(msg) {
        Utils.ifDebug(Config.Debug.Log, () => {
            console.log(msg);
        })  
    }

    // --- Other ---

    /**
     * @param {Phaser.Geom.Point} from 
     * @param {Phaser.Geom.Point} to 
     * @param {Number} speed 
     * @returns {Number}
     */
    static getTweenDuration(from, to, speed) {
        const dist = Phaser.Math.Distance.Between(
            from.x,
            from.y,
            to.x,
            to.y
        );

        const time = (dist / speed) * 1000;
        return time;
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
     * @param {String} s 
     * @returns {Boolean}
     */
    static stringIsDigit(s) {
        return !(isNaN(s));
    }

    // --- New ---
}