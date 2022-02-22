import Phaser from '../lib/phaser.js';

import Consts from './Consts.js';

export default class Door {

    /** @type {Phaser.Physics.Arcade.Sprite} */
    _first;

    /** @type {Phaser.Physics.Arcade.Sprite} */
    _second;

    /** @type {Number} */
    id;

    /**
     * @param {Phaser.Physics.Arcade.StaticGroup} group 
     * @param {Number} id
     * @param {Number} x 
     * @param {Number} y 
     * @param {Boolean} horizontal 
     */
    constructor(group, id, x, y, horizontal) {
        const me = this;

        me.id = id;
        me._first = me._createSprite(group, x, y, horizontal, 1);
        me._second = me._createSprite(group, x, y, horizontal, -1);
    }    

    getColliders() {
        const me = this;

        return [ me._first, me._second ];
    }

    open() {
        const me = this;

        me._first.disableBody(false, false);
        me._first.setFrame(7);
        me._second.disableBody(false, false);
        me._second.setFrame(7);
    }

    close() {
        const me = this;

        me._first.enableBody();
        me._first.setFrame(6);
        me._second.enableBody();
        me._second.setFrame(6);
    }

    /**
     * @param {Phaser.Physics.Arcade.StaticGroup} group 
     * @param {Number} x 
     * @param {Number} y 
     * @param {Boolean} horizontal 
     * @param {Number} sign
     * @returns {Phaser.Physics.Arcade.Sprite}
     */
    _createSprite(group, x, y, horizontal, sign) {
        const me = this;
    
        const sprite = group.create(
            horizontal ? x - sign *  Consts.Unit.Default / 2 : x, 
            horizontal ? y : y - sign * Consts.Unit.Default / 2, 
            'sprites', 
            6)
            .setAngle((sign > 0 ? 0 : 180) + (horizontal ? 0 : 90));

        sprite.parentDoor = me;

        return sprite;
    }
}