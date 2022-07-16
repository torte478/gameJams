import Phaser from '../../lib/phaser.js';
import Consts from '../Consts.js';

export default class Dice {

    /** @type {Phaser.GameObjects.Sprite} */
    _sprite;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Phaser.Geom.Rectangle} board
     */
    constructor(scene, board) {
        const me = this;
     
        const size = Consts.UnitBig;

        me._sprite = scene.add.sprite(
            (Consts.Viewport.Width + (board.x + board.width)) / 2,
            Consts.Viewport.Height / 2,
            'dice',
            0
        );
    }
}