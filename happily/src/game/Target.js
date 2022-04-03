import Phaser from '../lib/phaser.js';

import Config from './Config.js';
import Consts from './Consts.js';
import Enums from './Enums.js';
import Utils from './Utils.js';

export default class Button {

    /** @type {Phaser.GameObjects.Sprite} */
    _sprite;

    /** @type {Number} */
    _type;

    /** @type {Boolean} */
    isCompleted;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} type
     */
    constructor(scene, x, y, type) {
        const me = this;

        me._type = type;
        const anim = type == Enums.TargetType.IRON
             ? 'targets_iron'
             : (type == Enums.TargetType.KETTLE ? 'targets_kettle' : 'targets_sink');
        me._sprite = scene.add.sprite(x, y, 'targets')
            .play(anim);
    }

    checkComplete(pos) {
        const me = this;

        if (me.isCompleted)
            return false;

        const catched = Phaser.Math.Distance.Between(pos.x, pos.y, me._sprite.x, me._sprite.y) < 50;
        if (catched) {
            me.isCompleted = true;
            me._sprite.stop().setFrame(4 + me._type * 5);
        }

        return catched;
    }
}