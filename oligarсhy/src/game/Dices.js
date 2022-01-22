import Phaser from '../lib/phaser.js';

import Consts from './Consts.js';

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
        me._second.sprite = scene.add.sprite(
            Consts.SecondDiceOffset.X, 
            Consts.SecondDiceOffset.Y,
            'dice', 
            1);
    }

    /**
     * @param {Phaser.Geom.Point} point
     * @returns {Boolean}
     */
    checkClick(point) {
        const me = this;

        return me._checkDiceClick(true, point)
               || me._checkDiceClick(false, point);
    }

    /**
     * @returns {Boolean}
     */
    canDrop() {
        const me = this;

        return me._first.catched && me._second.catched;
    }

    /**
     * @param {Phaser.Geom.Point} point
     */
    drop(point) {
        const me = this;

        me._first.sprite
            .setPosition(point.x, point.y)
            .setVisible(true);
        
        me._second.sprite
            .setPosition(
                point.x + Consts.SecondDiceOffset.X, 
                point.y + Consts.SecondDiceOffset.Y)
            .setVisible(true);

        me._first.catched = false;
        me._second.catched = false;

        return {
            first: Phaser.Math.Between(1, 6),
            second: Phaser.Math.Between(1, 6)
        };
    }

    /**
     * @param {Boolean} isFirst 
     * @param {Phaser.Geom.Point} point
     * @returns {Boolean}
     */
    _checkDiceClick(isFirst, point) {
        const me = this,
              dice = isFirst
                     ? me._first
                     : me._second;

        if (dice.catched)
            return false;

        const clicked = Phaser.Geom.Rectangle.ContainsPoint(
            dice.sprite.getBounds(), 
            point);

        if (clicked) {
            dice.sprite.setVisible(false);
            dice.catched = true;
        }

        return clicked;
    }
}
