import Phaser from '../../lib/phaser.js';

import BaseEntity from './BaseEntity.js';

export default class Door extends BaseEntity {

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

        const sprite = group.create(x, y, 'sprites', 6)
            .setAngle(horizontal ? 0 : 90);

        me._initOrigin(sprite);
    }    

    open() {
        const me = this;

        me.origin.disableBody(false, false);
        me.origin.setFrame(7);
    }

    close() {
        const me = this;

        me.origin.enableBody();
        me.origin.setFrame(6);
    }
}