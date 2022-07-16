import Phaser from '../../lib/phaser.js';

import Consts from '../Consts.js';
import Utils from '../Utils.js';

export default class Dice {

    /** @type {Phaser.Scene} */
    _scene;

    /** @type {Phaser.GameObjects.Sprite} */
    _sprite;

    /** @type {Phaser.Time.TimerEvent} */
    _rollTask;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Phaser.Geom.Rectangle} board
     */
    constructor(scene, board) {
        const me = this;
     
        me._scene = scene;

        me._sprite = scene.add.sprite(
            (Consts.Viewport.Width + (board.x + board.width)) / 2,
            Consts.Viewport.Height / 2,
            'dice',
            0);
    }

    /**
     * @param {Phaser.Geom.Point} point 
     * @param {Boolean} ignoreAnimation
     * @param {Function} callback
     * @param {Object} context
     */
    tryRoll(point, ignoreAnimation, callback, context) {
        const me = this;

        if (!!me._rollTask && !me._rollTask.paused)
            throw 'dice is already rolling';

        const contains = Phaser.Geom.Rectangle.ContainsPoint(
            me._sprite.getBounds(),
            point);

        if (!contains)
            return;

        me._sprite.play('dice_roll');
        me._rollTask = me._scene.time.delayedCall(
            ignoreAnimation ? 0 :  Consts.DiceRollTime, 
            me._stopRoll,
            [ callback, context ], 
            me);
    }

    /**
     * @param {Function} callback 
     */
    _stopRoll(callback, context) {
        const me = this;

        me._sprite.stop();
        if (!!me._rollTask)
            me._rollTask.paused = true;

        const value = Utils.getRandom(1, 6);
        Utils.debugLog(`roll: ${value}`);

        if (!callback)
            return;

        if (!context)
            throw 'dice roll context is undefined';

        callback.call(context, value);
    }
}