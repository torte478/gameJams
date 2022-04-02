import Phaser from '../lib/phaser.js';

import Config from './Config.js';
import Consts from './Consts.js';
import Enums from './Enums.js';
import Utils from './Utils.js';

export default class Bottle {

    /** @type {Phaser.GameObjects.Sprite} */
    _sprite;

    /** @type {Boolean} */
    _taked;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Number} x 
     * @param {Number} y 
     */
    constructor(scene, x, y) {
        const me = this;

        me._sprite = scene.add.sprite(x, y, 'items', 7);
        me._sprite.play('bottle');

        me._taked = false;
    }

    check(pos) {
        const me = this;

        if (me._taked)
            return false;

        const needTake = Phaser.Math.Distance.BetweenPoints(pos, Utils.toPoint(me._sprite)) < 50;
        if (needTake) {
            me._sprite.stop();
            me._sprite.setFrame(9);
        }

        return needTake;
    }

    reset() {
        const me = this;

        me._sprite.play('bottle');
        me._taked = false;
    }
}