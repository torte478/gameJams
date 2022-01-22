import Phaser from '../lib/phaser.js';

export default class Dices {

    _first = {
        /** @type {Phaser.GameObjects.Sprite} */
        sprite: null,

        /** @type {Boolean} */
        catched: false
    };

    _second = {
        /** @type {Phaser.GameObjects.Sprite} */
        sprite: null,

        /** @type {Boolean} */
        catched: false
    };

    /**
     * @param {Phaser.Scene} scene 
     */
    constructor(scene) {
        const me = this;

        me._first.sprite = scene.add.sprite(0, 0, 'dice', 0);
        me._second.sprite = scene.add.sprite(75, 10, 'dice', 1);
    }

    /**
     * @param {Number} x 
     * @param {Number} y 
     * @returns {Boolean}
     */
    checkClick(x, y) {
        const me = this;

        return me._checkDiceClick(true, x, y)
               || me._checkDiceClick(false, x, y);
    }

    /**
     * @param {Boolean} isFirst 
     * @param {Number} x 
     * @param {Number} y 
     * @returns {Boolean}
     */
    _checkDiceClick(isFirst, x, y) {
        const me = this,
              dice = isFirst
                     ? me._first
                     : me._second;

        if (dice.catched)
            return false;

        const clicked = Phaser.Geom.Rectangle.Contains(
            dice.sprite.getBounds(), 
            x, y);

        if (clicked) {
            dice.sprite.setVisible(false);
            dice.catched = true;
        }

        return clicked;
    }
}
