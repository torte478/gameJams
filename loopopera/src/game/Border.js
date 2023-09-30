import Here from "../framework/Here.js";
import Consts from "./Consts.js";
import Player from "./Player.js";

export default class Border {
    
    /** @type {Phaser.Types.Physics.Arcade.ImageWithStaticBody} */
    _sprite;

    /** @type {Number} */
    _offsetY;

    /** @type {Number} */
    _lastX;

    /**
     * @param {Player} player 
     */
    constructor(player, offsetY) {
        const me = this;

        me._player = player;
        me._offsetY = offsetY;

        me._sprite = Here._.physics.add.staticImage(-100, 0, 'border');
        me.reset();
        me._lastX = me._sprite.x;

        Here._.physics.add.collider(me._sprite, me._player.toCollider());
    }

    update() {
        const me = this;

        me._resetPosition();
        me._lastX = me._sprite.x;
    }

    reset() {
        const me = this;
        me._lastX = -9999;
        me._resetPosition();
    }

    _resetPosition() {
        const me = this;

        me._sprite.setPosition(
            Math.max(me._lastX, Here._.cameras.main.scrollX - Consts.Unit.Normal), 
            me._player.toPos().y + me._offsetY);
        me._sprite.refreshBody();
    }
}