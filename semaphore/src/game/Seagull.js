import Here from '../framework/Here.js';
import Utils from '../framework/Utils.js';
import Phaser from '../lib/phaser.js';
import Consts from './Consts.js';

export default class Seagull {

    /** @type {Phaser.GameObjects.Image} */
    _bigSprite;

    /** @type {Boolean} */
    _isRunning;

    /** @type {Number} */
    _nextBigTimeMs;

    constructor() {
        const me = this;

        me._bigSprite = Here._.add.image(0, Consts.Viewport.Height, 'seagull_big')
            .setDepth(Consts.Depth.SEAGULL_BIG);

        me._isRunning = false;
        me._nextBigTimeMs = -1;
    }

    start() {
        const me = this;

        me._nextBigTimeMs = me._getNextBigTime();
        me._isRunning = true;
    }

    stop() {
        const me = this;
        me._hideBig();

        me._isRunning = false;
        me._nextBigTimeMs = -1;
    }

    update() {
        const me = this;

        if (!me._isRunning || me._nextBigTimeMs < 0)
            return;

        const now = new Date().getTime();
        if (now < me._nextBigTimeMs)
            return;

        me._nextBigTimeMs = -1;
        me._bigSprite.setPosition(0, Consts.Viewport.Height);
        Here._.tweens.add({
            targets: me._bigSprite,
            y: 0,
            ease: 'sine.out',
            duration: 1000
        });
    }

    _hideBig() {
        const me = this;

        Here._.tweens.add({
            targets: me._bigSprite,
            y: Consts.Viewport.Height,
            ease: 'sine.in',
            duration: 1000,
            onComplete: () => {
                me._nextBigTimeMs = me._getNextBigTime()
            }
        });       
    }

    _getNextBigTime() {
        const me = this;

        return new Date().getTime() + Utils.getRandom(1000, 5000, 1000);
    }
}