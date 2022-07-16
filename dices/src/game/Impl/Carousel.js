import Phaser from '../../lib/phaser.js';

import Config from '../Config.js';
import Consts from '../Consts.js';
import Utils from '../Utils.js';

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

    /** @type {Number} */
    _packSize;

    /**
     * @param {Phaser.Scene} scene 
     */
    constructor(scene) {
        const me = this;

        me._pool = scene.add.group();
        me._scene = scene;
        me._cards = Utils.buildArray(6, null);
        me._packSize = 0;

        me._startPosition = Utils.toPoint(
            Consts.CarouselPosition);

        me._minCount = Config.Carousel.Start;

        for (let i = 0; i < me._minCount; ++i)
            me._cards[i] = me._createCard(i);
    }

    roll(available, callback, context) {
        const me = this;

        const last = me._cards[me._cards.length - 1];

        for (let i = me._cards.length - 1; i > 0; --i)
            me._cards[i] = me._cards[i - 1];

        me._cards[0] = null;
        const needUsePack = me._packSize > 0;
        if (me._cards.filter(x => !!x).length < me._minCount || needUsePack)
            me._cards[0] = me._createCard(-1, available, needUsePack);

        const shift = `+=${Consts.CardSize.Height}`;
        me._scene.add.tween({
            targets: me._cards.filter(x => !!x).concat(!!last ? [ last ] : []),
            y: shift,
            duration: Consts.Speed.CarouselMs,
            onComplete: () => me._onRoll(last, callback, context)
        });
    }

    /**
     * @param {Number} value 
     * @returns {Number}
     */
    getBonusType(value) {
        const me = this;

        const card = me._cards[value - 1];
        return !!card ? card.bonusType : Consts.Undefined;
    }

    tryCardClick(value, point) {
        const me = this;

        const card = me._cards[value - 1];
        if (!card)
            return false;

        const contains = Phaser.Geom.Rectangle.ContainsPoint(
            card.getBounds(),
            point);

        if (!contains)
            return false;

        me._cards[value - 1] = null;
        me._pool.killAndHide(card);
        return true;
    }

    changeLevel(delta) {
        const me = this;

        me._minCount += delta;

        if (me._minCount < Config.Carousel.Min || me._minCount > Config.Carousel.Max)
            throw `wrong carousel level: ${me._minCount}`;
    }

    startPack() {
        const me = this;

        me._packSize = 6;
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

    _createCard(index, available, needUsePack) {
        const me = this;

        const position = me._getPosition(index);
        const card = me._pool.create(position.x, position.y, 'card');

        const types = !!available ? available : Config.StartBonuses;
        const type = Utils.getRandomEl(types);
        card.bonusType = type;

        if (needUsePack)
            me._packSize = Math.max(me._packSize - 1, 0);

        return card;
    }
}