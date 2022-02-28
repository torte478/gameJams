import Phaser from '../../lib/phaser.js';

import BaseEntity from './BaseEntity.js';

export default class Portal extends BaseEntity {

    /** @type {Boolean} */
    toFuture;

    /**
     * @param {Number} id
     * @param {Phaser.Physics.Arcade.StaticGroup} group 
     * @param {Number} x 
     * @param {Number} y 
     * @param {Boolean} toFuture 
     */
    constructor(id, group, x, y, toFuture) {
        super(id);

        const me = this;

        me.toFuture = toFuture;

        const sprite = group.create(x, y, 'sprites', toFuture ? 8 : 9);
        sprite.play(toFuture ? 'portal_red' : 'portal_blue');
        sprite.setFlipX(!toFuture);
        
        me._initOrigin(sprite);
    }    
}