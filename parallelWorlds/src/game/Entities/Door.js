import Phaser from '../../lib/phaser.js';

import BaseEntity from './BaseEntity.js';

export default class Door extends BaseEntity {

    static CLOSED_FRAME = 2;
    static OPEN_FRAME = 7;

    /**
     * @param {Number} id
     * @param {Phaser.Physics.Arcade.StaticGroup} group 
     * @param {Number} x 
     * @param {Number} y 
     * @param {Boolean} horizontal 
     */
    constructor(id, group, x, y, horizontal) {
        super(id);

        const me = this;

        const sprite = group.create(x, y, 'items', Door.CLOSED_FRAME)
            .setAngle(horizontal ? 0 : 90);

        me._initOrigin(sprite);
    }    

    open() {
        const me = this;

        me.origin.disableBody(false, false);

        if (me.origin.frame.name == Door.CLOSED_FRAME)
            me.origin.play('door_open');
        else {
            me.origin.stop();
            me.origin.setFrame(Door.OPEN_FRAME);
        }
    }

    close() {
        const me = this;

        me.origin.enableBody();

        if (me.origin.frame.name == Door.OPEN_FRAME)
            me.origin.playReverse('door_open');
        else {
            me.origin.stop();
            me.origin.setFrame(Door.CLOSED_FRAME);
        }
    }
}