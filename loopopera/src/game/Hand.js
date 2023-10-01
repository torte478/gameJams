import Here from "../framework/Here.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";

export default class Hand {

    /** @type {Number} */
    _dir;

    /** @type {Phaser.Physics.Arcade.Sprite} */
    _sprite;

    /** @type {Boolean} */
    _isAttack;

    /**
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} direction 
     * @param {Phaser.Physics.Arcade.Group} pool 
     */
    constructor(x, y, direction, pool) {
        const me = this;

        /** @type {Phaser.Physics.Arcade.Sprite} */
        me._sprite = pool.create(x, y, 'hand', 3);
        me._sprite
            .disableBody()
            .setDepth(Consts.Depth.Hands)
            .play('hand_start');

        me._dir = direction;
        if (direction == Enums.HandDirection.DOWN) 
            me._sprite.setAngle(180);
        else if (direction == Enums.HandDirection.LEFT)
            me._sprite.setAngle(270);
        else if (direction == Enums.HandDirection.RIGHT)
            me._sprite.setAngle(90);
        
        if (direction == Enums.HandDirection.UP || direction == Enums.HandDirection.DOWN)
            me._sprite.body.setSize(40, 120);
        else
            me._sprite.body.setSize(120, 40);

        me._isAttack = false;
        me._sprite.on(Phaser.Animations.Events.ANIMATION_COMPLETE, me._onAnimationStop, me)
    }

    kill() {
        const me = this;

        me._sprite.disableBody();
        me._sprite.body.destroy();
    }

    _onAnimationStop() {
        const me = this;

        if (me._isAttack) {
            me._sprite.refreshBody();
            me._sprite.enableBody();
        } else {
            me._sprite.play('hand_attack');
            me._isAttack = true;
        }
    }
}