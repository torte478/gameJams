import Phaser from '../lib/phaser.js';

import Config from './Config.js';
import Consts from './Consts.js';
import Enums from './Enums.js';
import Player from './Player.js';
import Utils from './Utils.js';

export default class She {

    /** @type {Phaser.Scene} */
    _scene;

    /** @type {Phaser.GameObjects.Sprite} */
    _sprite;

    /** @type {Phaser.GameObjects.Sprite} */
    _wings;

    /** @type {Phaser.GameObjects.Container} */
    _container;

    /** @type {Player} */
    _player;

    /** @type {Number} */
    _startFlyTime;

    /** @type {Phaser.Geom.Point} */
    _prevPosition;

    /** @type {Phaser.Tweens.Tween} */
    _tween;

    /** @type {Number} */
    state;

    /** @type {Boolean} */
    _quickFly;

    /** @type {Phaser.Sound.BaseSound} */
    _wingsFlySound;

    /** @type {Phaser.Sound.BaseSound} */
    _wingsFlyQuickSound;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Number} x 
     * @param {Number} y 
     */
    constructor(scene, x, y, player) {
        const me = this

        me._scene = scene;

        me._wings = scene.add.sprite(-5, -35, 'wings', 7);
        me._sprite = scene.add.sprite(0, 0, 'she', 0);

        me._container = scene.add.container(x, y, [ me._wings, me._sprite ])
            .setDepth(Consts.Depth.She);

        me._player = player;

        me.state = Enums.SheState.IDLE;
        me._prevPosition = Utils.toPoint(me._container);

        me._sprite.play('she_idle', true);

        me._quickFly = false;
        me._wingsFlySound = me._scene.sound.add('wings', { loop: true, volume: 0.1 });
        me._wingsFlySound.play();
        me._wingsFlySound.pause();

        me._wingsFlyQuickSound = me._scene.sound.add('wings_quick', { loop: true, volume: 0.1 });
        me._wingsFlyQuickSound.play();
        me._wingsFlyQuickSound.pause();
    }

    toGameObject() {
        const me = this;

        return me._container;
    }

    /**
     * @param {Phaser.Geom.Point} target 
     * @param {Function} finalCallback 
     */
    catchPlayer(target, catchCallback, finalCallback) {
        const me = this;

        me.state = Enums.SheState.CATCH;

        const playerObj = me._player.toGameObject();

        me._scene.tweens.timeline({
            tweens: [
                {
                    targets: me._container,
                    x: playerObj.x,
                    y: playerObj.y,
                    duration: 100,
                    onComplete: () => {
                        playerObj.setPosition(me._container.x, me._container.y);
                        if (!!catchCallback)
                            catchCallback();
                    }
                },
                {
                    targets: [ me._container, playerObj ],
                    x: target.x,
                    y: target.y,
                    ease: 'Sine.easeInOut',
                    duration: Utils.getTweenDuration(
                        Utils.toPoint(playerObj),
                        target,
                        150
                    )
                }
            ],
            onComplete: () => {
                me._container.setPosition(target.x, target.y);
                me._prevPosition = target;
                me.state = Enums.SheState.IDLE;

                if (!!finalCallback)
                    finalCallback();
            }
        });
    }

    /**
     * @param {Function} callback
     */
    startFly(callback) {
        const me = this;

        me.state = Enums.SheState.MOVEMENT;
        me._startFlyTime = new Date().getTime();

        const playerObj = me._player.toGameObject();

        me._stopTween();

        me._sprite.play('she_fly_quick', true);
        me._wings.play('wings_fly', true);
        me._wingsFlySound.resume();

        me._tween = me._scene.add.tween({
            targets: me._container,
            x: playerObj.x,
            y: playerObj.y,
            duration: 100,
            onComplete: () => {
                me.state = Enums.SheState.FLY;
                me._sprite.play('she_fly_player', true);

                if (!!callback)
                    callback();
                }
            });
    }

    _stopTween() {
        const me = this;

        if (!!me._tween) {
            me._tween.stop();
            me._wingsFlySound.pause();
            me._wingsFlyQuickSound.pause();
        }
    }

    getFlyVelocity() {
        const me = this;

        if (me.state != Enums.SheState.FLY)
            throw `wrong fly 'She' state ${Utils.enumToString(Enums.SheState, me.state)}`;

        const delta = new Date().getTime() - me._startFlyTime;
        
        if (delta <= Consts.Physics.FlyNormalTime) {
            me._quickFly = false;
            return Consts.Physics.FlyUpSpeed;
        }

        me._sprite.play('she_fly_player_slow', true);
        me._wings.play('wings_fly_quick', true);

        if (!me._quickFly) {
            me._wingsFlySound.pause();
            me._wingsFlyQuickSound.play();
        }

        me._quickFly = true;

        if (delta > Consts.Physics.FlySlowTime + Consts.Physics.FlyNormalTime)
            return Consts.Physics.FlyDownSpeed;

        return Consts.Physics.FlyUpSpeed + 
            (delta - Consts.Physics.FlyNormalTime) / Consts.Physics.FlySlowTime 
            * (Consts.Physics.FlyDownSpeed - Consts.Physics.FlyUpSpeed);
    }

    stopFly(target) {
        const me = this;

        me._sprite.play('she_fly', true);

        me._wingsFlyQuickSound.pause();
        me._wings.play('wings_fly', true);
        me._wingsFlySound.resume();

        me.state = Enums.SheState.MOVEMENT;
        me._tween = me._scene.add.tween({
            targets: me._container,
            x: target.x,
            y: target.y,
            ease: 'Sine.easeInOut',
            duration: Utils.getTweenDuration(
                Utils.toPoint(me._container),
                target,
                200),
            onComplete: () => { 
                me.state = Enums.SheState.IDLE; 
                me._sprite.play('she_idle', true);
                me._wings.play('wings_close');

                me._wingsFlySound.pause();
            }
        });
    }

    updateFlipX() {
        const me = this;

        if (me.state == Enums.SheState.FLY) {
            const flip = me._player._sprite.flipX;
            me._sprite.setFlipX(flip);
            me._wings.setFlipX(flip);
        }
            
        else if (me.state == Enums.SheState.IDLE) {
            const flip = me._player.toGameObject.x < me._container.x;
            me._sprite.setFlipX(flip);
            me._wings.setFlipX(flip);
        }
    }

    hitDrink(callback) {
        const me = this;

        me._stopTween();

        const player = Utils.toPoint(me._player.toGameObject());
        me._sprite.play('she_fly_quick', true);
        me._wings.play('wings_fly_quick', true);

        me._wingsFlyQuickSound.play();

        me._scene.tweens.timeline({
            targets: me._container,
            tweens: [
                {
                    x: player.x,
                    y: player.y - 500,
                    duration: 1500,
                    ease: 'Sine.easeInOut',
                },
                {
                    x: player.x,
                    y: player.y,
                    ease: 'Sine.easeIn',
                    duration: 250
                }
            ],
            onComplete: () => {
                me._container.setPosition(player.x, player.y);
                
                me.state = Enums.SheState.IDLE; 
                me._sprite.play('she_idle', true);
                me._wings.play('wings_close');
                
                me._wingsFlySound.pause();
                me._wingsFlyQuickSound.pause();

                if (!!callback)
                    callback();
            }
        });       
    }

    makeDeath() {
        const me = this;

        me._stopTween();

        me._wings.setVisible(false);
        me._sprite.play('she_death');
    }

    startWin(position, levelIndex, callback) {
        const me = this;

        me._stopTween();

        me._wings.play('wings_fly').setFlipX(true);
        me._wingsFlySound.resume();

        me._sprite.play('she_fly').setFlipX(true);
        me._container.setDepth(Consts.Depth.Foreground);
        me.state = Enums.SheState.WIN;

        me._scene.tweens.timeline({
            targets: me._container,
            onComplete: () => {
                if (!!callback)
                    callback();
            },
            tweens: [
                {
                    x: position.x - 15,
                    y: position.y - 300,
                    ease: 'Sine.easeInOut',
                    duration: 2000,
                    onComplete: () => {
                        me._wings.play('wings_close');
                        me._wingsFlySound.pause();
                    }
                },
                {
                    y: position.y,
                    ease: 'Sine.easeInOut',
                    duration: 1000,
                    onComplete: () => {
                        const anim = levelIndex <= 2
                            ? 'she_kiss'
                            : (levelIndex < 7 ? 'she_not_kiss' : 'she_cry');
                        me._sprite.play(anim);
                    }
                }
            ]
        })
    }
}