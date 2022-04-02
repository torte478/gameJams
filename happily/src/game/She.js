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

    /** @type {Number} */
    state;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Number} x 
     * @param {Number} y 
     */
    constructor(scene, x, y) {
        const me = this

        me._scene = scene;

        me._sprite = scene.add.sprite(0, 0, 'player', 1);

        me._container = scene.add.container(x, y, [ me._sprite ]);

        me.state = Enums.SheState.IDLE;
    }

    toGameObject() {
        const me = this;

        return me._container;
    }

    /**
     * 
     * @param {Player} player 
     * @param {Phaser.Geom.Point} target 
     * @param {Function} finalCallback 
     */
    catchPlayer(player, target, catchCallback, finalCallback) {
        const me = this;

        me.state = Enums.SheState.CATCH;

        const playerObj = player.toGameObject();

        me._scene.tweens.timeline({
            tweens: [
                {
                    targets: me._container,
                    x: playerObj.x,
                    y: playerObj.y,
                    //ease: 'Sine.easeOut',
                    duration: 100,
                    onComplete: () => {
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
                me.state = Enums.SheState.IDLE;

                if (!!finalCallback)
                    finalCallback();
            }
        });
    }
}