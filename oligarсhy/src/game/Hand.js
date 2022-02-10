import Phaser from '../lib/phaser.js';

import Consts from './Consts.js';
import Enums from './Enums.js';

export default class Hand {
    
    /** @type {Phaser.GameObjects.Image[]} */
    _content;

    /** @type {Number} */
    _state;

    constructor() {
        const me = this;

        me._content = [];
        me._state = Enums.HandState.EMPTY;
    }

    /**
     * @param {Phaser.GameObjects.Image} image //TODO : image?
     * @param {Phaser.Geom.Point} point 
     * @param {Number} type
     */
    tryTake(image, point, type) {
        const me = this;

        if (!image.visible)
            return false;

        const success = Phaser.Geom.Rectangle.ContainsPoint(
            image.getBounds(), 
            point);

        if (success) {
            image.setVisible(false);
            me._content.push(image);
            me._state = type;
        }

        return success;
    }

    /**
     * @param {Phaser.Geom.Point} point 
     */
    tryDrop(point) {
        const me = this;

        switch (me._state) {
            case Enums.HandState.DICES: {
                
                if (me._content.length != 2)
                    throw `Wrong hand content length: ${me._content.length}`;

                const inside = Phaser.Geom.Rectangle.ContainsPoint(
                    new Phaser.Geom.Rectangle(-690, -690, 1380, 1380),
                    point);

                if (!inside)
                    return false;

                const first = me._content.pop();
                const second = me._content.pop();

                first
                    .setPosition(point.x, point.y)
                    .setVisible(true);
        
                second
                    .setPosition(
                        point.x + Consts.SecondDiceOffset.X, 
                        point.y + Consts.SecondDiceOffset.Y)
                    .setVisible(true);

                me._state = Enums.HandState.EMPTY;

                break;
            }

            default: {
                while (me._content.length > 0) {
                    const item = me._content.pop();

                    item
                        .setPosition(point.x, point.y)
                        .setVisible(true);
                }               

                me._state = Enums.HandState.EMPTY;
            }
        }

        return true;
    }

    cancel() {
        const me = this;

        while (me._content.length > 0) {
            const item = me._content.pop();

            item.setVisible(true);
        }

        me._state = Enums.HandState.EMPTY;
    }
}