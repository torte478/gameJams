import Phaser from '../lib/phaser.js';

import Enums from './Enums.js';

export default class Controls {

    _keys = {
        left: null,
        right: null,
        up: null
    };

    /**
     * 
     * @param {Phaser.Input.Keyboard.KeyboardPlugin} keyboard 
     */
    constructor(keyboard) {
        const me = this;

        me._keys.left = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        me._keys.right = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        me._keys.up = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
    }

    isDown(key) {
        const me = this;

        switch (key) {
            case Enums.Keyboard.LEFT: 
                return me._keys.left.isDown;

            case Enums.Keyboard.RIGHT: 
                return me._keys.right.isDown;

            case Enums.Keyboard.UP: 
                return me._keys.up.isDown;

            default:
                return false;
        }
    }
}
