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
        futureAction: {
            key: null,
            once: false,
            isDown: false,
        },
        pastAction: {
            key: null,
            once: false,
            isDown: false,
        }
    };

    /**
     * 
     * @param {Phaser.Input.InputPlugin} input 
     */
    constructor(input) {
        const me = this;

        me._keys.left.key = input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        me._keys.right.key = input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        me._keys.up.key = input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);

        me._keys.futureAction.key = input.activePointer;
        me._keys.pastAction.key = input.activePointer;
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
            case Enums.Keyboard.PAST_ACTION: 
                return me._keys.pastAction.once;

            case Enums.Keyboard.FUTURE_ACTION: 
                return me._keys.futureAction.once;

            case Enums.Keyboard.JUMP: 
                return me._keys.up.once;

            default:
                return false;
        }
    }

    update() {
        const me = this;

        for (let name in me._keys) {
            const item = me._keys[name];

            switch (name) {
                case 'pastAction':
                    item.once = !item.isDown && item.key.isDown && !item.key.rightButtonDown();
                    item.isDown = item.key.isDown;
                    break;

                case 'futureAction':
                    item.once = !item.isDown && item.key.isDown && item.key.rightButtonDown();
                    item.isDown = item.key.isDown;
                    break;

                default:
                    item.once = Phaser.Input.Keyboard.JustDown(item.key);
            }
        }
    }
}
