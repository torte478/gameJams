import Here from "../framework/Here.js";
import Consts from "./Consts.js";

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
            .setOrigin(0.5, 1)
            .setDepth(Consts.Depth.Hands)
            .play('hand_start');

        me._sprite.body.setSize(40, 120);

        me._isAttack = false;
        me._sprite.on(Phaser.Animations.Events.ANIMATION_COMPLETE, me._onAnimationStop, me)
    }

    _onAnimationStop() {
        const me = this;

        if (me._isAttack) {
            me._sprite.enableBody();
            me._sprite.refreshBody();
        } else {
            me._sprite.play('hand_attack');
            me._isAttack = true;
        }
    }
}