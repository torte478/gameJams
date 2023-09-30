import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Config from "./Config.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";

export default class Player {

    /** @type {Phaser.GameObjects.Sprite} */
    _sprite;

    /** @type {Phaser.GameObjects.Container} */
    _container;

    /** @type {Boolean} */
    _hasLight;

    /** @type {Boolean} */
    _isBusy;

    /**
     * @param {Number} x 
     * @param {Number} y 
     */
    constructor(x, y) {
        const me = this;

        me._sprite = Here._.physics.add.sprite(0, 0, 'player', 0);

        me._container = Here._.add.container(x, y, [ me._sprite ])
            .setDepth(Consts.Depth.Player)
            .setSize(Consts.Unit.Normal, Consts.Unit.Big);

        me._hasLight = false;
        me._isBusy = false;

        me._initPhysics();
    }

    /**
     * @returns {Phaser.Physics.Arcade.Body}
     */
    toCollider() {
        const me = this;
        return me._container;
    }

    update(time) {
        const me = this;

        /** @type {Phaser.Physics.Arcade.Body} */
        const  body = me._container.body;

        const speed = Config.Player.Speed;

        if (!me._isBusy && Here.Controls.isPressing(Enums.Keyboard.RIGHT)) 
            body.setVelocityX(speed);
        else if (!me._isBusy && Here.Controls.isPressing(Enums.Keyboard.LEFT))
            body.setVelocityX(-speed);
        else
            body.setVelocityX(0);

        me._processJump(time);
        me._prevY = me._container.y;
        me._prevGrounded = body.blocked.down;
    }

    /**
     * @returns {Boolean}
     */
    tryTakeLight() {
        const me = this;

        if (me._hasLight)
            return false;

        me._hasLight = true;
        return true;
    }

    /**
     * @returns {Boolean}
     */
    tryGiveAwayLight() {
        const me = this;

        if (!me._hasLight)
            return false;

        me._hasLight = false;
        return true;
    }

    /**
     * @param {Number} posX 
     */
    teleport(posX) {
        const me = this;

        me._container.setPosition(posX, me._container.y);
    }

    setPosition(posX, posY) {
        const me = this;

        me._container.setPosition(posX, posY);
    }

    /** @type {Phaser.Geom.Point} */
    toPos() {
        const me = this;

        return Utils.toPoint(me._container);
    }

    /** @type {Boolean} */
    setBusy(isBusy) {
        const me = this;

        me._isBusy = isBusy;
    }

    _initPhysics() {
        const me = this;

        Here._.physics.world.enable(me._container);

        /** @type {Phaser.Physics.Arcade.Body} */
        const body = me._container.body;
        body.setGravityY(Config.Player.GravityFall);
    }

    _isFalling = true;
    _isJump = true;
    _prevY = 0;
    _lastJump = 9999;
    _prevGrounded = false;

    _processJump(time) {
        const me = this;

        /** @type {Phaser.Physics.Arcade.Body} */
        const  body = me._container.body;

        if (!me._isBusy && Here.Controls.isPressedOnce(Enums.Keyboard.UP) && body.blocked.down) {
            body.setGravityY(Config.Player.GravityJump);
            body.setVelocityY(Config.Player.JumpForce);
            me._isJump = true;
            me._lastJump = time;
            // console.log('jump start');
            return;
        }

        if (me._isJump && me._container.y > me._prevY) {
            body.setGravityY(Config.Player.GravityFall);
            me._isJump = false;
            // console.log('jump end')
            return;
        }

        if (!!body.blocked.down && !me._prevGrounded) {
            body.setAccelerationY(0);
            // console.log('grounded');
        }
            
        if (!body.blocked.down 
            && time - me._lastJump > Config.Player.JumpTimeMs) {
            body.setAccelerationY(Config.Player.FallAccelaration);
            me._isJumpPressing = false;
            // console.log('force down');
        }
    }
}