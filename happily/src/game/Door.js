import Phaser from '../lib/phaser.js';

import Config from './Config.js';
import Consts from './Consts.js';
import Enums from './Enums.js';
import Utils from './Utils.js';

export default class Door {

    /** @type {Phaser.Types.Physics.Arcade.SpriteWithStaticBody} */
    _sprite;

    /**
     * @param {} group
     * @param {Number} x 
     * @param {Number} y 
     */
    constructor(group, x, y) {
        const me = this;

        me._sprite = group.create(x, y, 'items', 2);
    }

    open() {
        const me = this;

        me._sprite.play('door_open');
        me._sprite.disableBody(false, false);
    }

    close() {
        const me = this;
        me._sprite.play('door_close');
        me._sprite.enableBody(true, me._sprite.x, me._sprite.y, true, true);
    }
}