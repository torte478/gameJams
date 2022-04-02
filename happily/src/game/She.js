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

    /** @type {Phaser.GameObjects.Container} */
    _container;

    /** @type {Player} */
    _player;

    /** @type {Number} */
    _startFlyTime;

    /** @type {Phaser.Geom.Point} */
    _prevPosition;

    /** @type {Number} */
    state;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Number} x 
     * @param {Number} y 
     */
    constructor(scene, x, y, player) {
        const me = this

        me._scene = scene;

        me._sprite = scene.add.sprite(0, 0, 'player', 1);

        me._container = scene.add.container(x, y, [ me._sprite ])
            .setDepth(Consts.Depth.She);

        me._player = player;

        me.state = Enums.SheState.IDLE;
        me._prevPosition = Utils.toPoint(me._container);
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

        me._scene.add.tween({
            targets: me._container,
            x: playerObj.x,
            y: playerObj.y,
            duration: 100,
            onComplete: () => {
                me.state = Enums.SheState.FLY;
                if (!!callback)
                    callback();
                }
            });
    }

    getFlyVelocity() {
        const me = this;

        if (me.state != Enums.SheState.FLY)
            throw `wrong fly 'She' state ${Utils.enumToString(Enums.SheState, me.state)}`;

        const delta = new Date().getTime() - me._startFlyTime;
        
        if (delta <= Consts.Physics.FlyNormalTime)
            return Consts.Physics.FlyUpSpeed;

        if (delta > Consts.Physics.FlySlowTime + Consts.Physics.FlyNormalTime)
            return Consts.Physics.FlyDownSpeed;

        return Consts.Physics.FlyUpSpeed + 
            (delta - Consts.Physics.FlyNormalTime) / Consts.Physics.FlySlowTime 
            * (Consts.Physics.FlyDownSpeed - Consts.Physics.FlyUpSpeed);
    }

    stopFly() {
        const me = this;

        me.state = Enums.SheState.MOVEMENT;
        me._scene.add.tween({
            targets: me._container,
            x: me._prevPosition.x,
            y: me._prevPosition.y,
            ease: 'ease.SineInOut',
            duration: Utils.getTweenDuration(
                Utils.toPoint(me._container),
                me._prevPosition,
                200),
            onComplete: () => { me.state = Enums.SheState.IDLE; }
        });
    }
}