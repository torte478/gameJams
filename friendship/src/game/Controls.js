import Phaser from '../lib/phaser.js';

import Enums from './Enums.js';

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
        down: {
            key: null,
            once: false
        },
        jump: {
            key: null,
            once: false,
        },
        fire: {
            key: null,
            once: false,
            isDown: false,
        }
    };

    /**
     * @param {Phaser.Input.InputPlugin} input 
     */
    constructor(input) {
        const me = this;

        me._keys.left.key = input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        me._keys.right.key = input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        me._keys.up.key = input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        me._keys.down.key = input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        me._keys.jump.key = input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        me._keys.fire.key = input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL);
    }

    isDown(key) {
        const me = this;

        switch (key) {
            case Enums.Keyboard.LEFT: 
                return me._keys.left.key.isDown;

            case Enums.Keyboard.RIGHT: 
                return me._keys.right.key.isDown;

            case Enums.Keyboard.UP: 
                return me._keys.up.key.isDown;
            
            case Enums.Keyboard.DOWN: 
                return me._keys.down.key.isDown;

            default:
                return false;
        }
    }

    isDownOnce(key) {
        const me = this;

        switch (key) {
            case Enums.Keyboard.FIRE: 
                return me._keys.fire.once;

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
