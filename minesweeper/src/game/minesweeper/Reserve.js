import Phaser from '../../lib/phaser.js';
import Consts from '../Consts.js';
import Enums from '../Enums.js';

export default class Reserve {

    /** @type {Phaser.Scene} */
    _scene;

    /** @type {Object[]]} */
    _reserve;

    /** @type {Number} */
    _maxSize;

    constructor(scene, x, y, startCount, maxSize) {
        const me = this;

        me._scene = scene;
        me._maxSize = maxSize;

        me._reserve = [];
        for (let i = 0; i < maxSize; ++i) {

            const content = i >= startCount
                ? Enums.Reserve.Empty
                : Enums.Reserve.Soilder;

            const item = scene.add.sprite(x, y - Consts.Unit * i, 'items', 13 + content);

            me._reserve.push({
                sprite: item,
                content: content
            });
        }
    }
}