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
        jump: {
            key: null,
            once: false
        },
        action: {
            key: null,
            once: false,
            isDown: false,
        },
        restart: {
            key: null,
            isDown: false
        }
    };

    /**
     * @param {Phaser.Input.InputPlugin} input 
     */
    constructor(input) {
        const me = this;

        me._keys.left.key = input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        me._keys.right.key = input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        me._keys.jump.key = input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
        me._keys.action.key = input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.X);
        me._keys.restart.key = input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    }

    isDown(key) {
        const me = this;

        switch (key) {
            case Enums.Keyboard.LEFT: 
                return me._keys.left.key.isDown;

            case Enums.Keyboard.RIGHT: 
                return me._keys.right.key.isDown;

            case Enums.Keyboard.JUMP:
                return me._keys.jump.key.isDown;

            case Enums.Keyboard.RESTART:
                return me._keys.restart.key.isDown;

            default:
                return false;
        }
    }

    isDownOnce(key) {
        const me = this;

        switch (key) {
            case Enums.Keyboard.ACTION: 
                return me._keys.action.once;

            case Enums.Keyboard.JUMP: 
                return me._keys.jump.once;

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
