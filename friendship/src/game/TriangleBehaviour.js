import Config from './Config.js';
import EnemyBehaviour from './EnemyBehaviour.js';
import Enums from './Enums.js';
import Utils from './utils/Utils.js';

export default class TriangleBehaviour extends EnemyBehaviour {


    /** @type {Number} */
    _left;

    /** @type {Number} */
    _right;

    /** @type {Boolean} */
    _isMovingLeft;

    /** @type {Boolean} */
    _isRest;

    /** @type {Number} */
    _nextActionTime;

    /**
     * 
     * @param {Number} left 
     * @param {Number} right 
     */
    constructor(left, right) {
        super();
        const me = this;

        me._left = left;
        me._right = right;
        me._isMovingLeft = true;
        me._isRest = true;
    }

    /**
     * @param {Phaser.Physics.Arcade.Body} body
     */
    update(body) {
        const me = this;

        if (me._isRest) {
            me._tryStartMoving(body);
        } else {
            me._updateMoving(body);
        }
    }

    /**
     * @param {Phaser.Physics.Arcade.Group} group
     * @param {Number} x 
     * @param {Number} y 
     */
     create(group, x, y) {
        const me = this;

        const sprite = group.create(x, y, 'triangle', 0)
            .setCollideWorldBounds(true);

        me._setNextTime();

        return sprite;
    }

    getSize() {
        return Config.EnemySize[Enums.EnemyType.TRIANGLE];
    }

    /**
     * @param {Phaser.Physics.Arcade.Body} body
     */
    _tryStartMoving(body) {
        const me = this;

        if (new Date().getTime() < me._nextActionTime)
            return;

        me._isRest = false;
        const sign = me._isMovingLeft ? -1 : 1;
        body.setVelocityX(sign * Config.Physics.TriangleSpeed);
    }

    /**
     * @param {Phaser.Physics.Arcade.Body} body
     */
    _updateMoving(body) {
        const me = this;

        const target = me._isMovingLeft ? me._left : me._right;
        if (Math.abs(body.x - target) > 10)
            return;

        me._isRest = true;
        body.setVelocityX(0);
        me._isMovingLeft = !me._isMovingLeft;

        me._setNextTime();
    }

    _setNextTime() {
        const me = this;

        me._nextActionTime = new Date().getTime() + Utils.getRandom(
            Config.Physics.TriangleActionDurationMin, 
            Config.Physics.TriangleActionDurationMax,
            500);
    }
}
