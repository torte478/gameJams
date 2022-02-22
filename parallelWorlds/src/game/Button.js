import Phaser from '../lib/phaser.js';

export default class Button {

    /** @type {Phaser.Physics.Arcade.Sprite} */
    _sprite;

    /** @type {Number} */
    id;

    /** @type {Boolean} */
    isPushed;

    /** @type {Number[]} */
    doorsToOpen;

    /** @type {Number[]} */
    doorsToClose;

    /** @type {Number[]} */
    buttonsToPush;

    /** @type {Number[]} */
    buttonsToPull;

    /**
     * @param {Phaser.Physics.Arcade.StaticGroup} group 
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} angle 
     */
    constructor(group, id, x, y, angle, doorsToOpen, doorsToClose, buttonsToPush, buttonsToPull) {
        const me = this;

        me.id = id;
        me.isPushed = false;

        me.doorsToOpen = !!doorsToOpen ? doorsToOpen : [];
        me.doorsToClose = !!doorsToClose ? doorsToClose : [];
        me.buttonsToPush = !!buttonsToPush ? buttonsToPush : [];
        me.buttonsToPull = !!buttonsToPull ? buttonsToPull : [];

        me._sprite = group.create(x, y, 'sprites', 2)
            .setAngle(angle);

        me._sprite.parentButton = me;
    }

    getCollider() {
        const me = this;

        return this._sprite;
    }

    push() {
        const me = this;

        me._sprite.setFrame(3);
        me.isPushed = true;
    }

    pull() {
        const me = this;

        me._sprite.setFrame(2);
        me.isPushed = false;
    }
}