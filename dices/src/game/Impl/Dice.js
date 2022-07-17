import Phaser from '../../lib/phaser.js';

import Config from '../Config.js';
import Consts from '../Consts.js';
import Utils from '../Utils.js';

export default class Dice {

    /** @type {Phaser.Scene} */
    _scene;

    /** @type {Phaser.GameObjects.Sprite} */
    _sprite;

    /** @type {Phaser.Time.TimerEvent} */
    _rollTask;

    /** @type {Phaser.Tweens.Tween} */
    _selectTween;

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
            Utils.getRandom(0, 5));
    }

    /**
     * @param {Phaser.Geom.Point} point 
     * @param {Boolean} ignoreAnimation
     * @param {Number[]} values
     * @param {Function} callback
     * @param {Object} context
     */
    tryRoll(point, ignoreAnimation, values, callback, context) {
        const me = this;

        if (!!me._rollTask && !me._rollTask.paused)
            throw 'dice is already rolling';

        const contains = Phaser.Geom.Rectangle.ContainsPoint(
            me._sprite.getBounds(),
            point);

        if (!contains)
            return;

        me.roll(ignoreAnimation, values, callback, context);
    }

    roll(ignoreAnimation, values, callback, context, expected) {
        const me = this;

        if (Utils.isDebug(Config.Debug.IgnoreRollAnim))
            ignoreAnimation = true;

        if (!!me._selectTween) {
            me._selectTween.pause();
            me._selectTween = null;
            me._sprite.setScale(1);
        }

        me._sprite.play('dice_roll');
        me._scene.sound.stopByKey('click');
        me._scene.sound.play('click', { volume: Config.Volume.Click });
        const value = !!expected ? expected : Utils.getRandomEl(values);

        me._rollTask = me._scene.add.tween({
            targets: me._sprite,
            scale: { from: 1.25, to: 0.75 },
            yoyo: true,
            duration: (ignoreAnimation ? 0 : Consts.Speed.DiceRollMs) / 2,
            ease: 'Sine.easeInOut',
            onComplete: () => me._stopRoll(value, callback, context)
        });
    }

    select() {
        const me = this;

        if (!!me._selectTween) {
            me._selectTween.pause();
            me._selectTween = null;
            me._sprite.setScale(1);
        }

        me._selectTween = me._scene.add.tween({
            targets: me._sprite,
            scale: { from: 1, to: 1.25 },
            yoyo: true,
            duration: Consts.Speed.Selection,
            ease: 'Sine.easeInOut',
            repeat: -1,
        });
    }

    /**
     * @param {Function} callback 
     */
    _stopRoll(value, callback, context) {
        const me = this;

        me._sprite.stop();
        me._sprite.setFrame(value - 1);
        me._sprite.setScale(1);
        
        if (!!me._rollTask)
            me._rollTask.paused = true;

        Utils.debugLog(`roll: ${value} ${value === Consts.DiceSpawnValue ? 'Spawn!' : ''}`);

        if (!callback)
            return;

        if (!context)
            throw 'dice roll context is undefined';

        callback.call(context, value);
    }
}