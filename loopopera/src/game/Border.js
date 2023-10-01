import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Config from "./Config.js";
import Consts from "./Consts.js";
import Player from "./Player.js";

export default class Border {
    
    /** @type {Phaser.Types.Physics.Arcade.ImageWithStaticBody} */
    _sprite;

    /** @type {Number} */
    _offsetY;

    /** @type {Number} */
    _lastX;

    _isCollide = false;

    _collideTime = null;

    _isReverse = false;

    /**
     * @param {Player} player 
     */
    constructor(player, offsetY) {
        const me = this;

        me._player = player;
        me._offsetY = offsetY;

        me._sprite = Here._.physics.add.staticImage(-100, 0, 'border')
            .setVisible(false);

        if (Utils.isDebug(Config.Debug.Global))
            me._sprite.setVisible(true);
        
        me.reset();
        me._lastX = me._sprite.x;

        Here._.physics.add.collider(
            me._sprite, 
            me._player.toCollider(),
            (b, p) => {
                if (!me._isCollide)
                    me._isCollide = true;
            });
    }

    update(time) {
        const me = this;

        me._resetPosition();
        me._lastX = me._sprite.x;

        if (me._isCollide && !me._collideTime)        
            me._collideTime = time;
        else if (!me._isCollide)
            me._collideTime = null;
    }

    reset() {
        const me = this;
        me._lastX = -9999;
        me._resetPosition();
    }

    reverse() {
        const me = this;

        me._isReverse = !me._isReverse;
        me._lastX = me._isReverse
            ? 9999999
            : -9999;
        me._resetPosition();
    }

    _resetPosition() {
        const me = this;

        me._sprite.setPosition(
            me._isReverse
                ? Math.min(me._lastX, Here._.cameras.main.scrollX + Consts.Viewport.Width + Consts.Unit.Normal)
                : Math.max(me._lastX, Here._.cameras.main.scrollX - Consts.Unit.Normal), 
            me._player.toPos().y + me._offsetY);

        me._sprite.refreshBody();
    }
}