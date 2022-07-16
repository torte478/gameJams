import Phaser from '../../lib/phaser.js';
import Config from '../Config.js';

import Consts from '../Consts.js';
import Utils from '../Utils.js';
import Board from './Board.js';

export default class Carousel {

    /** @type {Phaser.GameObjects.Group} */
    _pool;

    /** @type {Phaser.GameObjects.Image[]} */
    _cards;

    /** @type {Phaser.Geom.Point} */
    _startPosition;

    /** @type {Phaser.Scene} */
    _scene;

    /** @type {Number} */
    _minCount;

    /**
     * @param {Phaser.Scene} scene 
     */
    constructor(scene) {
        const me = this;

        me._pool = scene.add.group();
        me._scene = scene;
        me._cards = Utils.buildArray(6, null);

        me._startPosition = Utils.toPoint(
            Consts.CarouselPosition);

        me._minCount = Config.Carousel.Start;

        for (let i = 0; i < me._minCount; ++i)
            me._cards[i] = me._createCard(i);
    }

    roll(callback, context) {
        const me = this;

        const last = me._cards[me._cards.length - 1];

        for (let i = me._cards.length - 1; i > 0; --i)
            me._cards[i] = me._cards[i - 1];

        me._cards[0] = null;
        if (me._cards.filter(x => !!x).length < me._minCount)
            me._cards[0] = me._createCard(-1);

        const shift = `+=${Consts.CardSize.Height}`;
        me._scene.add.tween({
            targets: me._cards.filter(x => !!x).concat(!!last ? [ last ] : []),
            y: shift,
            duration: Consts.Speed.CarouselMs,
            onComplete: () => me._onRoll(last, callback, context)
        });
    }

    _onRoll(last, callback, context) {
        const me = this;      
        
        if (!!last)
            me._pool.killAndHide(last);

        if (!!callback)
            callback.call(context);
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