import Phaser from '../lib/phaser.js';
import Config from './Config.js';
import Consts from './Consts.js';
import Controls from './Controls.js';
import Enums from './Enums.js';
import GunLogic from './GunLogic.js';
import Audio from './utils/Audio.js';
import Utils from './utils/Utils.js';

export default class Player {

    /** @type {Phaser.GameObjects.Container} */
    _container;

    /** @type {Phaser.GameObjects.Sprite} */
    _sprite;

    /** @type {Phaser.GameObjects.Sprite} */
    _gun;

    /** @type {Controls} */
    _controls;

    /** @type {GunLogic} */
    _gunLogic;
    
    /** @type {Boolean} */
    _charging;

    /** @type {Audio} */
    _audio;

    /** @type {Boolean} */
    _isWalkAudioPlaying;

    /**
     * 
     * @param {Phaser.Scene} scene 
     * @param {Number} x
     * @param {Number} y
     * @param {Controls} controls
     * @param {GunLogic} gunLogic
     * @param {Audio} audio
     */
    constructor(scene, x, y, controls, gunLogic, audio) {
        const me = this;

        me._controls = controls;
        me._sprite = scene.add.sprite(0, 0, 'player', 0);
        me._gun = scene.add.sprite(0, 0, 'gun', 0);
        me._gunLogic = gunLogic;
        me._charging = false;
        me._audio = audio;
        me._isWalkAudioPlaying = false;

        me._container = scene.add.container(x, y, [ 
            me._sprite,
            me._gun
            ])
            .setDepth(Consts.Depth.Player)
            .setSize(Consts.Unit, Consts.Unit * 2);

        me._container.owner = me;
        scene.physics.world.enable(me._container);
        
        /** @type {Phaser.Physics.Arcade.Body} */
        const body = me._container.body;
        body.setGravityY(Config.Physics.Gravity);

        me._container.isPlayer = true;
    }

    toGameObject() {
        const me = this;

        return me._container;
    }

    update(delta) {
        const me = this;

        const lookDirection = me._updateMovement();

        if (me._charging)
            me._gunLogic.charge(delta);
        else
            if (/*me._container.x >= 2100 &&*/ me._controls.isDownOnce(Enums.Keyboard.FIRE))
                me._gunLogic.tryShot(
                    Utils.toPoint(me.toGameObject()),
                    lookDirection,
                    me._sprite.flipX ? -1 : 1);
    }

    startCharge() {
        const me = this;

        me._charging = true;
    }

    stopCharge() {
        const me = this;

        me._charging = false;
    }

    _updateMovement() {
        const me = this,
              body = me._getBody();

        let movementKeyPress = false;
        if (me._controls.isDown(Enums.Keyboard.LEFT)) {
            body.setVelocityX(-Config.Physics.PlayerSpeed);
            me._sprite.setFlipX(true);
            me._gun.setFlipX(true);
            movementKeyPress = true;
        } else if (me._controls.isDown(Enums.Keyboard.RIGHT)) {
            body.setVelocityX(Config.Physics.PlayerSpeed)
            me._sprite.setFlipX(false);
            me._gun.setFlipX(false);
            movementKeyPress = true;
        } else {
            body.setVelocityX(0);
        }

        if (movementKeyPress && body.blocked.down) {
            if (!me._isWalkAudioPlaying) {
                me._audio.play('walk_snow', { loop: true, volume: 0.5 });
                me._isWalkAudioPlaying = true;
            }
        } else if (me._isWalkAudioPlaying) {
            me._audio.stop('walk_snow');
            me._isWalkAudioPlaying = false;
        }

        let lookDirection;
        if (me._controls.isDown(Enums.Keyboard.UP)) {
            me._gun.setAngle(me._gun.flipX ? 90 : 270);
            lookDirection = -1;
        } else if (me._controls.isDown(Enums.Keyboard.DOWN)) {
            me._gun.setAngle(me._gun.flipX ? 270 : 90);
            lookDirection = 1;
        }
        else {
            me._gun.setAngle(0);
            lookDirection = 0;
        }

        if (me._controls.isDownOnce(Enums.Keyboard.JUMP) && body.blocked.down) {
            body.setVelocityY(Config.Physics.PlayerJump);
            me._audio.play('jump');
        }

        return lookDirection;
    }

    /**
     * @returns {Phaser.Physics.Arcade.Body}
     */
    _getBody() {
        const me = this;

        return me._container.body;
    }
}