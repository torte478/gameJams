import Phaser from '../../lib/phaser.js';
import Config from '../Config.js';
import Consts from '../Consts.js';
import Utils from '../Utils.js';
import Cell from './Cell.js';

export default class Piece {

    /** @type {Phaser.Scene} */
    _scene;

    /** @type {Phaser.GameObjects.Sprite} */
    _sprite;

    /** @type {Cell} */
    cell;

    /** @type {Phaser.Tweens.Tween} */
    _movementTween;

    /** @type {Phaser.Tweens.Tween} */
    _selectTween;

    _currentScale;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Cell} cell 
     * @param {Number} frame 
     * @param {Number} scale
     */
    constructor(scene, cell, frame, scale) {
        const me = this;

        me.cell = cell;
        me._scene = scene;

        me._currentScale = scale;

        me._sprite = scene.add
            .sprite(cell.x, cell.y, 'piece', frame)
            .setScale(scale)
            .setDepth(Consts.Depth.Piece);
    }

    /**
     * @param {Cell} target 
     * @param {Number}
     * @param {Function} callback 
     * @param {Context} context 
     */
    move(target, scale, callback, context) {
        const me = this;

        if (!!me._movementTween && !me._movementTween.paused)
            throw `piece already moving from ${me.cell.toString()}`;

        let duration = Utils.getTweenDuration(
            Utils.toPoint(me._sprite),
            Utils.toPoint(target),
            Consts.Speed.PieceMovement);

        if (target.index === -1)
            duration = Consts.Speed.PieceStorageMs;

        me._movementTween = me._scene.tweens.add({
            targets: me._sprite,
            x: target.x,
            y: target.y,
            scale: scale,
            duration: duration,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                me.cell = target;
                me._movementTween.paused = true;
                me._movementTween = null;
                me._currentScale = scale;

                if (!!callback)
                    callback.call(context);
            }
        });
    }

    select() {
        const me = this;

        me.unselect();

        me._selectTween = me._scene.add.tween({
            targets: me._sprite,
            scale: { from: me._currentScale, to: 1.25 * me._currentScale },
            yoyo: true,
            duration: Consts.Speed.Selection,
            ease: 'Sine.easeInOut',
            repeat: -1,
        });
    }

    unselect() {
        const me = this;

        if (!!me._selectTween) {
            me._selectTween.pause();
            me._selectTween = null;
            me._sprite.scale = me._currentScale;
        }
    }
}