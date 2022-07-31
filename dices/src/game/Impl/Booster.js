import Phaser from '../../lib/phaser.js';
import Config from '../Config.js';
import Consts from '../Consts.js';
import Utils from '../Utils.js';

export default class Booster {
    
    /** @type {Phaser.GameObjects.Sprite[]} */
    _dices;

    /** @type {Phaser.GameObjects.Container} */
    _container;

    /** @type {Boolean[]} */
    _values;

    /** @type {Number} */
    _cycleCounter;

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

        me._container = scene.add.container(position.x, position.y, me._dices)
            .setVisible(Utils.isDebug(Config.Debug.isDebug));
        me._values = Utils.buildArray(6, true);
        me._cycleCounter = 0;
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

        if (value < 0 && value >= me._dices.length)
            throw `invalid booster value: ${value}`;

        me._values[value - 1] = false;
        me._dices[value - 1].setVisible(false);
    }

    toValues(endgame)  {
        const me = this;

        const result = [];
        for (let i = 0; i < me._values.length; ++i)
            if (!!me._values[i])
                result.push(i + 1);

        if (endgame === Consts.Undefined)
            return result;

        const shuffled = Utils.shuffle(result);
        const endGameResult = [ endgame ];
        for (let i = 0; i < shuffled.length && endGameResult.length < 6 - me._cycleCounter; ++i)
            if (shuffled[i] != endgame)
                endGameResult.push(shuffled[i]);

        Utils.debugLog(`endgame: (${endgame}) [${result}] => [${endGameResult}]`);

        return endGameResult;
    }

    applyCycle() {
        const me = this;

        ++me._cycleCounter;
    }

    disableCycle() {
        const me = this;

        me._cycleCounter = 0;
    }
}