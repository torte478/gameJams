import Phaser from '../lib/phaser.js';
import Config from './Config.js';
import EnemyBehaviour from './EnemyBehaviour.js';
import Movable from './Movable.js';
import Utils from './utils/Utils.js';

export default class Enemy {

    /** @type {EnemyBehaviour} */
    _behaviour;

    /** @type {Phaser.Physics.Arcade.Group} */
    _group;

    /** @type {Phaser.Physics.Arcade.Sprite} */
    _sprite;

    /** @type {Boolean} */
    _needUpdate;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Phaser.Physics.Arcade.Group} group
     * @param {Number} x 
     * @param {Number} y 
     * @param {EnemyBehaviour} behaviour
     */
    constructor(scene, group, x, y, behaviour) {
        const me = this;

        me._behaviour = behaviour;
        me._sprite = me._behaviour.create(group, x, y);

        me._group = group;

        me._sprite.owner = me;

        me._needUpdate = true;
    }

    update(delta) {
        const me = this;

        me._behaviour.update(me._sprite.body);
    }

    backToPool() {
        const me = this;

        me._sprite.setVelocity(0);
        me._sprite.setAcceleration(0);
        me._needUpdate = false;
        me._sprite.setPosition(Config.TrashPosition.x, Config.TrashPosition.y);
        me._sprite.body.setEnable(false);
        me._group.killAndHide(me._sprite);       
    }

    getSize() {
        const me = this;

        return me._behaviour.getSize();
    }

    getType() {
        const me = this;

        return me._behaviour.getType();
    }
}