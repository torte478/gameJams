import Phaser from '../lib/phaser.js';
import Config from './Config.js';
import Consts from './Consts.js';

export default class Player {

    /** @type {Phaser.GameObjects.Sprite} */
    _sprite;

    /** @type {Phaser.GameObjects.Container} */
    _container;

    /** @type {Number} */
    _groundTime;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Number} x 
     * @param {Number} y 
     */
    constructor(scene, x, y) {
        const me = this

        me._sprite = scene.add.sprite(0, 0, 'player', 0);

        me._container = scene.add.container(x, y, [ me._sprite ]);
        me._container.setSize(Consts.Unit.PlayerWidth, Consts.Unit.PlayerHeight);

        me._groundTime = new Date().getTime();
    }

    update() {
        const me = this;

        if (me._container.body.blocked.down)
            me._groundTime = new Date().getTime();
    }

    toCollider() {
        const me = this;

        return me._container;
    }

    setVelocityX(sign) {
        const me = this;

        if (sign != 0)
            me._sprite.setFlipX(sign < 0);

        const velocity = me._getVelocity();
        me._container.body.setVelocityX(sign * velocity);
    }

    tryJump() {
        const me = this;

        if (!me._container.body.blocked.down)
            return false;

        me._container.body.setVelocityY(Config.Physics.Jump);
        return true;
    }

    _getVelocity() {
        const me = this;

        if (me._container.body.blocked.down)
            return Config.Physics.VelocityGround;

        const delta = new Date().getTime() - me._groundTime;
        if (delta > Config.Physics.FrictionTime)
            return Config.Physics.VelocityJump;

        const velocity = Config.Physics.VelocityGround - 
            (delta * (Config.Physics.VelocityGround - Config.Physics.VelocityJump)) / 
            Config.Physics.FrictionTime;
        return velocity;
    }
}
