import Phaser from '../lib/phaser.js';

import Config from './Config.js';
import Consts from './Consts.js';
import Utils from './Utils.js';

export default class Player {

    /** @type {Phaser.Physics.Arcade.Sprite} */
    _sprite;

    /** @type {Boolean} */
    isBusy;

    /**
     * @param {Phaser.Scene} scene
     */
     constructor(scene) {
        const me = this;

        me._sprite = scene.physics.add.sprite(Config.Player.X, Config.Player.Y, 'sprites', 0)
            .setDepth(Consts.Depth.Player);

        me.isBusy = false;
    }

    /**
     * @returns {Phaser.GameObjects.GameObject}
     */
    getCollider() {
        const me = this;

        return me._sprite;
    }

    /**
     * @param {Number} sign 
     */
    setDirectionX(sign) {
        const me = this;

        if (sign != 0)
            me._sprite.setFlipX(sign < 0);

        me._sprite.setVelocityX(sign * Config.Physics.VelocityX);
    }

    /**
     * @returns {Boolean}
     */
    tryJump() {
        const me = this;

        if (!me._sprite.body.blocked.down)
            return false;
        
        me._sprite.setVelocityY(Config.Physics.Jump);
        return true;
    }

    /**
     * @param {Number} nextLayer 
     * @param {Phaser.Physics.Arcade.ArcadePhysics} physics
     * @param {Phaser.Tilemaps.Tilemap} level
     * @returns {Boolean}
     */
    canTeleport(nextLayer, physics, level) {
        const me = this;

        if (!me._sprite.body.blocked.down)
            return null;

        const bounds = me._sprite.getBounds();

        const relativeY = bounds.centerY % Consts.Viewport.Height;
        const nextY = nextLayer * Consts.Viewport.Height + relativeY;

        const originTarget = new Phaser.Geom.Rectangle(
            bounds.left,
            nextY - bounds.height / 2,
            bounds.width,
            bounds.height);

        if (me._isCollisionFree(originTarget, physics, level))
            return new Phaser.Geom.Point(
                bounds.centerX,
                nextY);

        const gridTarget = new Phaser.Geom.Rectangle(
            Math.round(bounds.left / Consts.Unit.Small) * Consts.Unit.Small,
            Math.round((nextY - bounds.height / 2) / Consts.Unit.Small) * Consts.Unit.Small,
            bounds.width,
            bounds.height);

        if (!me._isCollisionFree(gridTarget, physics, level))
            return null;

        return new Phaser.Geom.Point(
            gridTarget.x + gridTarget.width / 2,
            gridTarget.y + gridTarget.height / 2
        );
    }

    /**
     * 
     * @param {Phaser.Geom.Point} position 
     * @param {Phaser.Tweens.TweenManager} tweens 
     */
    teleport(position, tweens) {
        const me = this;

        me._sprite.disableBody(false, false);
        me._sprite.body.setAllowGravity(false);
        me.isBusy = true;

        tweens.add({
            targets: me._sprite,
            x: position.x,
            duration: 2000,
            ease: 'Sine.easeOut',
            onComplete: () => {
                me._sprite.enableBody(true, position.x, position.y, true, true);
                me._sprite.body.setAllowGravity(true);
                me.isBusy = false;
            }
        })
    }

    /**
     * @returns {Phaser.Geom.Point}
     */
    getPosition() {
        const me = this;

        return new Phaser.Geom.Point(me._sprite.x, me._sprite.y);
    }

    /**
     * @param {Number} y 
     */
    setPositionY(y) {
        const me = this;

        me._sprite.setY(y);
    }

    /**
     * @param {Phaser.Geom.Rectangle} rect 
     * @param {Phaser.Physics.Arcade.ArcadePhysics} physics
     * @param {Phaser.Tilemaps.Tilemap} level
     * @returns {Boolean}
     */
    _isCollisionFree(rect, physics, level) {
        const me = this;

        const bodies = physics.overlapRect(rect);

        if (bodies.length > 0)
            return false;

        if (!Utils.isTileFree(rect, level))
            return false;
        
        return true;
    }
}
