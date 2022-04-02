import Phaser from '../lib/phaser.js';

import Config from './Config.js';
import Consts from './Consts.js';
import Enums from './Enums.js';
import Utils from './Utils.js';

export default class Player {

    /** @type {Phaser.Scene} */
    _scene;

    /** @type {Phaser.GameObjects.Sprite} */
    _sprite;

    /** @type {Phaser.GameObjects.Container} */
    _container;

    /** @type {Number} */
    _groundTime;
    
    /** @type {Number} */
    _levelHeight;

    /** @type {Boolean} */
    isBusy;

    /** @type {Object} */
    lastGround = {

        /** @type {Number} */
        time: null,

        /** @type {Boolean} */
        flip: false,

        /** @type {Phaser.Geom.Point} */
        pos: null,

        /** @type {Number} */
        startY: null
    };

    /**
     * @param {Phaser.Scene} scene 
     * @param {Number} x 
     * @param {Number} y 
     */
    constructor(scene, x, y, levelHeight) {
        const me = this

        me._scene = scene;

        me._sprite = scene.add.sprite(0, 0, 'player', 0);

        me._container = scene.add.container(x, y, [ me._sprite ])
            .setDepth(Consts.Depth.Player);
        me._container.setSize(Consts.Unit.PlayerWidth, Consts.Unit.PlayerHeight);

        me._levelHeight = levelHeight;

        me.isBusy = false;

        me.lastGround.time = new Date().getTime();
        me.lastGround.flip = false;
        me.lastGround.pos = Utils.buildPoint(x, y);
        me.lastGround.startY = y;
    }

    update() {
        const me = this;

        const blockedDown = me._container.body.blocked.down;

        if (blockedDown) {
            me.lastGround.time = new Date().getTime();
            me.lastGround.flip = me._sprite.flipX;
            me.lastGround.pos = Utils.toPoint(me._container);
            me.lastGround.startY = me._container.y;
            return Enums.PlayerStatus.GROUNDED
        }
        
        return Enums.PlayerStatus.JUMP;
    }

    disablePhysics() {
        const me = this;

        me._container.body.setVelocity(0);
        me._scene.physics.world.disable(me._container);
    }
    
    awake() {
        const me = this;

        me.isBusy = false;
        me._scene.physics.world.enable(me._container);
        me._container.body.setVelocity(0, 10);
        me._container.body.setAllowGravity(true);
        me.lastGround.startY = me._container.y;
    }

    toGameObject() {
        const me = this;

        return me._container;
    }

    setVelocityX(sign, fly) {
        const me = this;

        if (me.isBusy)
            return;

        if (sign != 0)
            me._sprite.setFlipX(sign < 0);

        const velocity = me._getVelocity(fly);
        me._container.body.setVelocityX(sign * velocity);

        if (fly)
            me._sprite.play('player_fly', true)
        else if (!me.isGrounded())
            me._sprite.play('player_jump', true)
        else if (sign != 0)
            me._sprite.play('player_walk', true)
        else
            me._sprite.play('player_idle', true);
    }

    setVelocityY(velocity) {
        const me = this;

        me._container.body.setVelocityY(velocity);
    }

    tryJump() {
        const me = this;

        if (me.isBusy)
            return false;

        if (!me._container.body.blocked.down)
            return false;

        me._container.body.setVelocityY(Consts.Physics.Jump);
        return true;
    }

    isGrounded() {
        const me = this;

        return !me.isBusy && me._container.body.blocked.down;
    }

    startFly() {
        const me = this;

        me._container.body.setAllowGravity(false);
        me._container.body.setVelocity(0);
    }
    
    startDrink() {
        const me = this;

        me.isBusy = true;
        me._sprite.play('player_drink', true);
        me._container.body.setVelocity(0);
    }

    _getVelocity(fly) {
        const me = this;

        if (me._container.body.blocked.down)
            return Consts.Physics.VelocityGround;

        const delta = new Date().getTime() - me.lastGround.time;
        if (fly || delta > Consts.Physics.FrictionTime)
            return Consts.Physics.VelocityJump;

        const velocity = Consts.Physics.VelocityGround - 
            (delta * (Consts.Physics.VelocityGround - Consts.Physics.VelocityJump)) / 
            Consts.Physics.FrictionTime;
        return velocity;
    }
}
