import Phaser from '../lib/phaser.js';

import Consts from './Consts.js';
import Enums from './Enums.js';

export default class Hand {
    
    /** @type {Phaser.GameObjects.Image[]} */
    _content;

    /** @type {Number} */
    _type;

    constructor() {
        const me = this;

        me._content = [];
        me._type = Enums.HandContent.EMPTY;
    }

    /**
     * @param {Phaser.GameObjects.Image} image 
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
            me._type = type;
        }

        return success;
    }

    /**
     * @param {Phaser.Geom.Point} point 
     */
    drop(point) {
        const me = this;

        switch (me._type) {
            case Enums.HandContent.DICES: {
                
                if (me._content.length != 2)
                    throw `Wrong hand content length: ${me._content.length}`;

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

                me._type = Enums.HandContent.EMPTY;

                break;
            }

            default: {
                while (me._content.length > 0) {
                    const item = me._content.pop();

                    item
                        .setPosition(point.x, point.y)
                        .setVisible(true);
                }               

                me._type = Enums.HandContent.EMPTY;
            }
        }
    }

    cancel() {
        const me = this;

        while (me._content.length > 0) {
            const item = me._content.pop();

            item.setVisible(true);
        }

        me._type = Enums.HandContent.EMPTY;
    }
}