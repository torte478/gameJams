import Config from "./Config.js";

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
     static lastOrDefault(array, f) {
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
     static lastOrDefaultIndex(array, f) {
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
     * @param {Boolean} flag 
     * @param {Function} func 
     * @returns {Boolean}
     */
    static ifDebug(flag, func) {
        if (Utils.isDebug(flag))
            return func();

        return false;
    }

    // TODO: refactor is/if Debug everywhere

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

    /**
     * @param {Number} from 
     * @param {Number} to 
     * @param {Number} debug 
     * @returns {Number}
     */
    static getRandom(from, to, debug) {
        return debug !== undefined && Utils.isDebug(Config.Debug.Random)
            ? debug
            : Phaser.Math.Between(from, to);
    }

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

    /**
     * 
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
     * @param {Object[]} arr 
     * @returns {Object}
     */
    static getRandomEl(arr) {
        const index = Phaser.Math.Between(0, arr.length - 1);
        return arr[index];
    }

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
     * TODO: add everywhere
     * @param {Phaser.Scene} scene 
     * @param {Phaser.GameObjects.GameObject} obj
     * @param {Phaser.Geom.Point} target
     * @param {Number} speed
     * @param {Function} callback
     * @returns {Phaser.Tweens.Tween}
     */
    static startMovementTween(scene, obj, target, speed, callback) {
        return scene.tweens.add({
            targets: obj,
            x: target.x,
            y: target.y,
            ease: 'Sine.easeInOut',
            duration: Utils.getTweenDuration(
                Utils.toPoint(obj),
                target,
                speed),
            onComplete: () => {
                if (!!callback)
                    callback();
            }
        });
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
     * @param {String} s 
     * @returns {Boolean}
     */
    static stringIsDigit(s) {
        return !(isNaN(s));
    }
}