import Phaser from '../lib/phaser.js';

export default class Keyboard {

    /** @type {Phaser.Events.EventEmitter} */
    emitter;

    /** @type {Array} */
    keys;

    /** 
     * @param {Phaser.Input.Keyboard.KeyboardPlugin} keyboard
     * */
    constructor(keyboard) {
        const me = this;

        me.emitter = new Phaser.Events.EventEmitter();
        me.keys = [
            Phaser.Input.Keyboard.KeyCodes.LEFT,
            Phaser.Input.Keyboard.KeyCodes.RIGHT,
            Phaser.Input.Keyboard.KeyCodes.UP,
            Phaser.Input.Keyboard.KeyCodes.DOWN,
            Phaser.Input.Keyboard.KeyCodes.E,

            Phaser.Input.Keyboard.KeyCodes.ONE,
            Phaser.Input.Keyboard.KeyCodes.TWO
        ]
            .map((key) => keyboard.addKey(key));
    }

    update() {
        const me = this;

        me.keys.forEach((value) => {
            /** @type {Phaser.Input.Keyboard.Key} */
            const key = value;

            if (Phaser.Input.Keyboard.JustDown(key)) {
                me.emitter.emit(
                    'keyDown',
                    key.originalEvent.key);
            }

            if (key.isDown)
                me.emitter.emit(
                    'keyPressed', 
                    key.originalEvent.key);
        });
    }    

    /**
     * @param {Number} keyCode 
     * @returns {Boolean}
     */
    isPressed(keyCode) {
        const me = this;
        const keys = me.keys.filter((key) => key.keyCode === keyCode);

        return keys.length > 0 && keys[0].isDown;
    }
}