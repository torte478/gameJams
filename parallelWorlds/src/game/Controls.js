import Phaser from '../lib/phaser.js';

import Enums from './Enums.js';
import Utils from './Utils.js';

export default class Controls {

    _keys = {
        left: {
            key: null,
            once: false
        },
        right: {
            key: null,
            once: false
        },
        up: {
            key: null,
            once: false
        },
        x: {
            key: null,
            once: false
        },
        c: {
            key: null,
            once: false
        }
    };

    /**
     * 
     * @param {Phaser.Input.Keyboard.KeyboardPlugin} keyboard 
     */
    constructor(keyboard) {
        const me = this;

        me._keys.left.key = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        me._keys.right.key = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        me._keys.up.key = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        me._keys.x.key = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
        me._keys.c.key = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.C);
    }

    isDown(key) {
        const me = this;

        switch (key) {
            case Enums.Keyboard.LEFT: 
                return me._keys.left.key.isDown;

            case Enums.Keyboard.RIGHT: 
                return me._keys.right.key.isDown;

            default:
                return false;
        }
    }

    isDownOnce(key) {
        const me = this;

        switch (key) {
            case Enums.Keyboard.X: 
                return me._keys.x.once;

            case Enums.Keyboard.C: 
                return me._keys.c.once;

            case Enums.Keyboard.UP: 
                return me._keys.up.once;

            default:
                return false;
        }
    }

    update() {
        const me = this;

        for (let name in me._keys) {
            const item = me._keys[name];
            item.once = Phaser.Input.Keyboard.JustDown(item.key);
        }
    }
}
