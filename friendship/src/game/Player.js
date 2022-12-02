import Phaser from '../lib/phaser.js';
import Config from './Config.js';
import Consts from './Consts.js';
import Controls from './Controls.js';
import Enums from './Enums.js';

export default class Player {

    /** @type {Phaser.GameObjects.Container} */
    _container;

    /** @type {Phaser.GameObjects.Sprite} */
    _sprite;

    /** @type {Controls} */
    _controls;

    /**
     * 
     * @param {Phaser.Scene} scene 
     * @param {Number} x
     * @param {Number} y
     * @param {Controls} controls
     */
    constructor(scene, x, y, controls) {
        const me = this;

        me._controls = controls;
        me._sprite = scene.add.sprite(0, 0, 'player', 0);

        me._container = scene.add.container(x, y, [ me._sprite ])
            .setDepth(Consts.Depth.Player)
            .setSize(Consts.Unit, Consts.Unit * 2);

        me._container.owner = me;
        scene.physics.world.enable(me._container);
        
        /** @type {Phaser.Physics.Arcade.Body} */
        const body = me._container.body;
        body.setGravityY(Config.Physics.Gravity);
    }

    toGameObject() {
        const me = this;

        return me._container;
    }

    update() {
        const me = this,
              body = me._getBody();

        if (me._controls.isDown(Enums.Keyboard.LEFT)) {
            body.setVelocityX(-Config.Physics.PlayerSpeed);
            me._sprite.setFlipX(true);
        } else if (me._controls.isDown(Enums.Keyboard.RIGHT)) {
            body.setVelocityX(Config.Physics.PlayerSpeed)
            me._sprite.setFlipX(false);
        } else {
            body.setVelocityX(0);
        }

        if (me._controls.isDownOnce(Enums.Keyboard.JUMP) && body.blocked.down) {
            body.setVelocityY(Config.Physics.PlayerJump);
        }
    }

    /**
     * @returns {Phaser.Physics.Arcade.Body}
     */
    _getBody() {
        const me = this;

        return me._container.body;
    }
}