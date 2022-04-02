import Phaser from '../lib/phaser.js';

import Config from './Config.js';
import Consts from './Consts.js';
import Enums from './Enums.js';
import Utils from './Utils.js';

export default class Button {

    /** @type {Phaser.GameObjects.Sprite} */
    _sprite;

    /** @type {Phaser.Geom.Rectangle} */
    _zone;

    /** @type {Boolean} */
    isPressed;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Number} x 
     * @param {Number} y 
     */
    constructor(scene, x, y) {
        const me = this;

        me._sprite = scene.add.image(x, y, 'items', 0);
        me.isPressed = false;
        me._zone = new Phaser.Geom.Rectangle(x - 25, y - 50, 50, 50);
    }

    check(player, she) {
        const me = this;

        const pressed = Phaser.Geom.Rectangle.ContainsPoint(me._zone, player)
                        || Phaser.Geom.Rectangle.ContainsPoint(me._zone, she);

        if (pressed == me.isPressed)
            return false;

        me._sprite.setFrame(pressed ? 1 : 0);
        me.isPressed = pressed;
        return true;
    }
}