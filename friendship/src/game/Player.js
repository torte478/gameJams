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

    /** @type {Number} */
    _jumpCount;

    /** @type {Phaser.GameObjects.Sprite} */
    _insideSprite;

    /** @type {Boolean} */
    _isInside;

    /** @type {Boolean} */
    isBusy;

    /** @type {Boolean} */
    _isAnimation;

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
        me._sprite.play('player_idle');
        me._gun = scene.add.sprite(0, 0, 'gun', 1);
        me._gunLogic = gunLogic;
        me._charging = false;
        me._audio = audio;
        me._AudioPlaying = false;
        me._jumpCount = 0;
        me.isBusy = false;
        me._isInside = false;
        me._isAnimation = false;

        me._insideSprite = scene.add.sprite(0, 0, 'player', 7)
            .setVisible(false);

        me._container = scene.add.container(x, y, [ 
            me._sprite,
            me._gun,
            me._insideSprite
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

        if (me._charging) {
            me._gunLogic.charge(delta);
            if (me._gunLogic._charge >= Config.Start.MaxGunCharge)
                 me._audio.stop('charger');
        }

        if (me.isBusy)
            return;

        const lookDirection = me._updateMovement();

        if (me._controls.isDownOnce(Enums.Keyboard.FIRE) && !me._isInside) {
            if (Config.WasTriggerAction)
                return;

            me._gunLogic.tryShot(
                Utils.toPoint(me.toGameObject()),
                lookDirection,
                me._sprite.flipX ? -1 : 1);
        }
    }

    startCharge() {
        const me = this;

        me._charging = true;
        me._audio.playSingleton('charger', { loop: true, volume: 0.25});
    }

    stopCharge() {
        const me = this;

        me._charging = false;
        me._audio.stop('charger');
    }

    toggleAnimation(type) {
        const me = this;

        if (me._isAnimation) {
            me.isBusy = false;
            me._isAnimation = false;
        } else {
            if (type == Enums.PlayerAnimation.FIRE) {
                me._insideSprite.play('player_fire');
                me._container.setPosition(400, me._container.y);
                console.log(me._container.po)
            }
            else
                return;

            me.isBusy = true;
            me._isAnimation = true;
        }
    }

    _updateMovement() {
        const me = this,
              body = me._getBody();

        let movementKeyPress = false;
        if (me._controls.isDown(Enums.Keyboard.LEFT)) {
            body.setVelocityX(-Config.Physics.PlayerSpeed);
            me._sprite.setFlipX(true);
            me._gun.setFlipX(true);
            me._insideSprite.setFlipX(true);
            movementKeyPress = true;
        } else if (me._controls.isDown(Enums.Keyboard.RIGHT)) {
            body.setVelocityX(Config.Physics.PlayerSpeed)
            me._sprite.setFlipX(false);
            me._gun.setFlipX(false);
            me._insideSprite.setFlipX(false);
            movementKeyPress = true;
        } else {
            body.setVelocityX(0);
        }

        if (movementKeyPress && body.blocked.down) {
            me._sprite.play('player_walk', true);
            me._insideSprite.play('player_walk_inside', true);
            if (!me._isInside) {
                me._audio.playSingleton('walk_snow', { loop: true, volume: 0.5 });
                me._isWalkAudioPlaying = true;
            }
        } else {
            me._audio.stop('walk_snow');
            me._isWalkAudioPlaying = false;
        }

        let lookDirection;
        if (me._controls.isDown(Enums.Keyboard.UP)) {
            me._gun.setFrame(2);
            lookDirection = -1;
        } else if (me._controls.isDown(Enums.Keyboard.DOWN)) {
            me._gun.setFrame(3);
            lookDirection = 1;
        }
        else {
            me._gun.setFrame(1);
            lookDirection = 0;
        }

        if (body.blocked.down)
            me._jumpCount = 0;
        else if (me._jumpCount == 0)
            me._jumpCount = 1;

        if (me._controls.isDownOnce(Enums.Keyboard.JUMP) && me._jumpCount < 2 && !me._isInside) {
            body.setVelocityY(Config.Physics.PlayerJump);
            me._audio.play('jump');
            me._sprite.play('player_jump');
            me._jumpCount += 1;
        }

        if (body.velocity.x == 0 && body.blocked.down) {
            me._sprite.play('player_idle', true);
            me._insideSprite.play('player_idle_inside', true);
        }
        if (body.velocity.y != 0)
            me._sprite.play('player_jump');

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