import Phaser from '../../lib/phaser.js';
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

        me._sprite = scene.add
            .sprite(cell.x, cell.y, 'piece', frame)
            .setScale(scale);
    }

    /**
     * @param {Cell} target 
     * @param {Function} callback 
     * @param {Context} context 
     */
    makeStep(target, callback, context) {
        const me = this;

        if (!!me._movementTween && !me._movementTween.paused)
            throw `piece already moving from ${me.cell.toString()}`;

        me._movementTween = me._scene.tweens.add({
            targets: me._sprite,
            x: target.x,
            y: target.y,
            duration: Consts.Speed.PieceMovementMs,
            onComplete: () => {
                me.cell = target;
                me._movementTween.paused = true;
                me._movementTween = null;

                if (!!callback)
                    callback.call(context);
            }
        })
    }
}