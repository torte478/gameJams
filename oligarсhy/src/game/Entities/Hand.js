import Phaser from '../../lib/phaser.js';

import Consts from '../Consts.js';
import Enums from '../Enums.js';
import Helper from '../Helper.js';
import Utils from '../Utils.js';

export default class Hand {

    /** @type {Phaser.Scene} */
    _scene;
    
    /** @type {Phaser.GameObjects.Image[]} */
    _content;

    /** @type {Number} */
    _state;

    /** @type {Number[]} */
    _money;

    /** @type {Phaser.GameObjects.Container} */
    _container;

    /** @type {Phaser.Tweens.Timeline} */
    _timeline;

    /**
     * @param {Phaser.Scene} scene
     */
    constructor(scene) {
        const me = this;

        me._scene = scene;

        me._content = [];
        me._state = Enums.HandState.EMPTY;
        
        me._money = [];
        for (let x in Enums.Money) {
            me._money.push(0);
        }

        const image = scene.add.image(0, 0, 'hand', 0);
        me._container = scene.add.container(0, 0, [ image ])
            .setDepth(Consts.Depth.Hand);
    }

    tryMakeAction(point, type, config, callback) {
        const me = this;

        if (!me._validateAction(point, type, config))
            return false;

        me._startTimeline(
            point,
            () => {
                me._innerTimelineCallback(point, type, config);

                if (!!callback)
                    callback();
            }
        );

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

    /**
     * @param {Phaser.Geom.Point} pos 
     */
    moveTo(pos, delta) {
        const me = this;

        if (me._isBusy())
            return;

        const dist = Phaser.Math.Distance.Between(
            pos.x,
            pos.y,
            me._container.x,
            me._container.y);

        if (dist < 10)
            return;

        const distance = {
            x: pos.x - me._container.x,
            y: pos.y - me._container.y
        };

        const shift = {
            x: Math.min(Math.abs(distance.x), Consts.HandSpeed.Idle),
            y: Math.min(Math.abs(distance.y), Consts.HandSpeed.Idle)
        };

        const movement = {
            x: shift.x * Math.sign(distance.x) * (delta / 1000),
            y: shift.y * Math.sign(distance.y) * (delta / 1000)
        };

        me._container.setPosition(
            me._container.x + movement.x,
            me._container.y + movement.y,
        );
    }

    _isBusy() {
        const me = this;

        return me._timeline != null 
               && me._timeline.isPlaying();
    }

    /**
     * @param {Phaser.Geom.Point} target 
     */
    _getTweenDuration(target) {
        const me = this;

        const dist = Phaser.Math.Distance.Between(
            me._container.x,
            me._container.y,
            target.x,
            target.y
        );

        const time = (dist / Consts.HandSpeed.Action) * 1000; // TODO : to const
        return time;
    }

    _startTimeline(target, callback) {
        const me = this;

        me._timeline = me._scene.tweens.timeline({
            targets: me._container,

            tweens: [
            {
                x: target.x,
                y: target.y,
                ease: 'Sine.easeInOut',
                duration: me._getTweenDuration(target),
            },
            {
                scale: { from: 1, to: 0.75 },
                duration: Consts.HandSpeed.Grab / 2,
                onComplete: () => {
                    if (!!callback)
                        callback();    
                }
            },
            {
                scale: { from: 0.75, to: 1 },
                duration: Consts.HandSpeed.Grab
            }]
        });
    }

    _validateAction(point, type, config) {
        const me = this;

        if (me._isBusy())
            return false;

        switch (type) {
            case Enums.HandAction.TAKE_DICE:
            case Enums.HandAction.TAKE_PIECE: {
                if (!config.image.visible)
                    return false;

                const canTake = Phaser.Geom.Rectangle.ContainsPoint(
                    config.image.getBounds(), 
                    point);

                if (!canTake)
                    return false;
                
                break;
            }

            case Enums.HandAction.DROP_DICES: {
                if (me._content.length != 2)
                    throw `Wrong hand content length: ${me._content.length}`;

                const inside = Phaser.Geom.Rectangle.ContainsPoint(
                    new Phaser.Geom.Rectangle(-690, -690, 1380, 1380),
                    point);

                if (!inside)
                    return false;

                break;
            }

            case Enums.HandAction.DROP_PIECE:
            case Enums.HandAction.TAKE_BILL:
            case Enums.HandAction.CLICK_BUTTON:
                return true;

            default: 
                throw `Unknown hand action ${Utils.enumToString(Enums.HandAction, type)}`;
        }

        return true;
    }

    _innerTimelineCallback(point, type, config) {
        const me = this;

        switch (type) {
            case Enums.HandAction.TAKE_DICE:
            case Enums.HandAction.TAKE_PIECE: {
                config.image.setVisible(false);
                me._content.push(config.image);
                me._state = config.type;
                break;
            }

            case Enums.HandAction.DROP_DICES: {
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

            case Enums.HandAction.DROP_PIECE: {
                while (me._content.length > 0) {
                    const item = me._content.pop();

                    item
                        .setPosition(point.x, point.y)
                        .setVisible(true);
                }   

                me._state = Enums.HandState.EMPTY;
                break;
            }

            case Enums.HandAction.TAKE_BILL: {
                ++me._money[config.index];
                me._state = Enums.HandState.MONEY;
        
                console.log(`money: ${me._money.join(';')} (${Helper.getTotalMoney(me._money)})`); // TODO : fix all console.log    

                break;
            }

            case Enums.HandAction.CLICK_BUTTON: {            
                break;
            }

            default: 
                throw `Unknown hand action callback ${Utils.enumToString(Enums.HandAction, type)}`;
        }
    }
}