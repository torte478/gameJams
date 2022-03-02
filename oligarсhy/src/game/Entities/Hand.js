import Phaser from '../../lib/phaser.js';

import Consts from '../Consts.js';
import Enums from '../Enums.js';
import Helper from '../Helper.js';

export default class Hand {
    
    /** @type {Phaser.GameObjects.Image[]} */
    _content;

    /** @type {Number} */
    _state;

    /** @type {Number[]} */
    _money;

    constructor() {
        const me = this;

        me._content = [];
        me._state = Enums.HandState.EMPTY;
        
        me._money = [];
        for (let x in Enums.Money) {
            me._money.push(0);
        }
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

        for (let i = 0; i < me._money.length; ++i)
            me._money[i] = 0;

        me._state = Enums.HandState.EMPTY;
    }

    takeBill(index) {
        const me = this;

        ++me._money[index];
        me._state = Enums.HandState.MONEY;

        console.log(`money: ${me._money.join(';')} (${Helper.getTotalMoney(me._money)})`); // TODO : fix all console.log
    }
    
    dropMoney() {
        const me = this;

        if (me._state != Enums.HandState.MONEY)
            return [];

        let result = [];
        for (let i = 0; i < me._money.length; ++i) {
            result.push(me._money[i]);
            me._money[i] = 0;
        }

        me._state = Enums.HandState.EMPTY;

        return result;
    }

    getTotalMoney() {
        const me = this;

        return Helper.getTotalMoney(me._money);
    }

    getMoneyAction() {
        const me = this;

        let billCount = 0;
        for (let i = 0; i < me._money.length; ++i)
            billCount += me._money[i];

        const total = me.getTotalMoney();

        if (billCount == 1 && total >= Consts.BillValue[1])
            return Enums.ActionType.SPLIT_MONEY;

        if (billCount > 1 && total >= Consts.BillValue[1])
            return Enums.ActionType.MERGE_MONEY;
        
        return null;
    }
}