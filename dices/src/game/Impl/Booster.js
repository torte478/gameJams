import Phaser from '../../lib/phaser.js';
import Consts from '../Consts.js';
import Utils from '../Utils.js';

export default class Booster {
    
    /** @type {Phaser.GameObjects.Sprite[]} */
    _dices;

    /** @type {Phaser.GameObjects.Container} */
    _container;

    /** @type {Boolean[]} */
    _values;

    /**
     * 
     * @param {Phaser.Scene} scene 
     * @param {Phaser.Geom.Point} position 
     */
    constructor(scene, position) {
        const me = this;

        me._dices = [];
        for (let i = 0; i < 6; ++i) {
            const dice = scene.add.sprite(i * Consts.UnitSmall, 0, 'dice_small', i);
            me._dices.push(dice);
        }

        me._container = scene.add.container(position.x, position.y, me._dices);
        me._values = Utils.buildArray(6, true);
    }

    disable() {
        const me = this;

        for (let i = 0; i < me._values.length; ++i) {
            me._values[i] = true;
            me._dices[i].setVisible(true);
        }
    }

    enable(value) {
        const me = this;

        me._values[value - 1] = false;
        me._dices[value - 1].setVisible(false);
    }

    toValues()  {
        const me = this;

        const result = [];
        for (let i = 0; i < me._values.length; ++i)
            if (!!me._values[i])
                result.push(i + 1);

        return result;
    }
}