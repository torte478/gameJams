import Here from "../framework/Here.js";
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

        me._initPhysics();
    }

    /**
     * @returns {Phaser.Physics.Arcade.Body}
     */
    getCollider() {
        const me = this;
        return me._container;
    }

    update() {
        const me = this;

        /** @type {Phaser.Physics.Arcade.Body} */
        const  body = me._container.body;

        const speed = Config.PlayerPhysics.GroundSpeed;

        if (Here.Controls.isPressing(Enums.Keyboard.RIGHT)) 
            body.setVelocityX(speed);
        else if (Here.Controls.isPressing(Enums.Keyboard.LEFT))
            body.setVelocityX(-speed);
        else
            body.setVelocityX(0);

        if (Here.Controls.isPressedOnce(Enums.Keyboard.UP) && body.blocked.down)
            body.setVelocityY(Config.PlayerPhysics.Jump);
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

    _initPhysics() {
        const me = this;

        Here._.physics.world.enable(me._container);

        /** @type {Phaser.Physics.Arcade.Body} */
        const body = me._container.body;
        body.setGravityY(Config.PlayerPhysics.Gravity);
    }
}