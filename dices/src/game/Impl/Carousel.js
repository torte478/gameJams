import Phaser from '../../lib/phaser.js';
import Config from '../Config.js';

import Consts from '../Consts.js';
import Utils from '../Utils.js';
import Board from './Board.js';

export default class Carousel {

    /** @type {Phaser.GameObjects.Group} */
    _pool;

    /** @type {Phaser.GameObjects.Image} */
    _cards;

    /** @type {Phaser.Geom.Point} */
    _startPosition;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Board} board
     */
    constructor(scene, board) {
        const me = this;

        me._pool = scene.add.group();
        me._cards = Utils.buildArray(6, null);

        me._startPosition = Utils.toPoint(
            Consts.CarouselPosition);

        // me._cards[0] = me._createCard(0);
        for (let i = 0; i < 6; ++i)
            me._cards[i] = me._createCard(i);
    }

    _getPosition(index) {
        const me = this;

        return Utils.buildPoint(
            me._startPosition.x,
            me._startPosition.y + index * 96
        );
    }

    _createCard(index) {
        const me = this;

        const position = me._getPosition(index);
        return me._pool.create(position.x, position.y, 'card');
    }
}