import Enums from "../game/Enums.js";
import Utils from "./Utils.js";

export default class Controls {

    static _schema = [
        { key: Enums.Keyboard.MAIN_ACTION, value: Phaser.Input.Keyboard.KeyCodes.SPACE },
        { key: Enums.Keyboard.SECOND_ACTION, value: Phaser.Input.Keyboard.KeyCodes.Z },
        { key: Enums.Keyboard.RESTART, value: Phaser.Input.Keyboard.KeyCodes.R }
    ];

    /** @type {KeyConfig[]} */
    _keys;

    /**
     * @param {Phaser.Scene} scene 
     */
    constructor(scene) {
        const me = this;

        const keyboard = scene.input.keyboard;
        me._keys = Utils.buildArray(Controls._schema.length);
        for (let kv of Controls._schema) {
            me._keys[kv.key] = {
                key: keyboard.addKey(kv.value),
                justPressed: false
            };
        }
    }

    update() {
        const me = this;

        for (let key of me._keys)
            key.justPressed = Phaser.Input.Keyboard.JustDown(key.key);
    }

    /**
     * @param {Number} key 
     * @returns {Boolean}
     */
    isPressing(key) {
        const me = this;

        return me._keys[key].key.isDown;
    }

    isPressed(key) {
        const me = this;

        return me._keys[key].justPressed;
    }
}

class KeyConfig {

    /** @type {Phaser.Input.Keyboard.Key } */
    key;

    /** @type {Boolean} */
    justPressed;
}