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

    /** @type {Phaser.Geom.Point} */
    _waitPosition;

    /** @type {Number} */
    _side;

    /** @type {Phaser.GameObjects.Image} */
    _sprite;

    /**
     * @param {Phaser.Scene} scene
     */
    constructor(scene, index) {
        const me = this;

        me._scene = scene;
        me._side = index;

        me._content = [];
        me._state = Enums.HandState.EMPTY;
        
        me._money = [];
        for (let i = 0; i < Consts.BillCount; ++i)
            me._money.push(0);

        me._sprite = scene.add.image(0, 0, 'hand', 0);

        const angle = Helper.getAngle(index);
        me._waitPosition =  Helper.rotate(
            Utils.toPoint(Consts.HandWaitPosition),
            index);

        me._container = scene.add.container(me._waitPosition.x, me._waitPosition.y, [ me._sprite ])
            .setDepth(Consts.Depth.Hand)
            .setAngle(angle);
    }

    /**
     * @param {Phaser.Geom.Point} point 
     * @param {Number} type 
     * @param {Object} config 
     * @param {Function} callback 
     * @returns {Boolean}
     */
    tryMakeAction(point, type, config, callback) {
        const me = this;

        if (!me._validateAction(point, type, config))
            return false;

        me._startGrabTimeline(
            point,
            () => {
                me._innerTimelineCallback(point, type, config);

                if (!!callback)
                    callback();
            }
        );

        return true;
    }

    /**
     * @param {Function} callback 
     * @returns {Object}
     */
    cancel(callback) {
        const me = this;

        me._resetState();

        if (me._content.length == 0  && !!callback)
            return callback();

        for (let i = 0; i < me._content.length; ++i)
            me._resetContentItem(i, callback, i == me._content.length - 1);

        me._content = [];
    }
    
    /**
     * @returns {Number[]}
     */
    dropBills() {
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

    /**
     * @returns {Number}
     */
    dropMoney() {
        const me = this;

        const bills = me.dropBills();
        return Helper.getTotalMoney(bills);
    }

    /**
     * @returns {Number}
     */
    getTotalMoney() {
        const me = this;

        return Helper.getTotalMoney(me._money);
    }

    /**
     * @returns {Number}
     */
    getAvailableMoneyAction() {
        const me = this;

        let billCount = 0;
        for (let i = 0; i < me._money.length; ++i)
            billCount += me._money[i];

        if (me.getTotalMoney() < Consts.BillValue[1])
            return null;

        if (billCount == 1)
            return Enums.ActionType.SPLIT_MONEY;

        if (billCount > 1)
            return Enums.ActionType.MERGE_MONEY;
        
        return null;
    }

    /**
     * @param {Phaser.Geom.Point} pos 
     */
    moveTo(pos, delta) {
        const me = this;

        if (me.isBusy())
            return;

        const dist = Phaser.Math.Distance.Between(
            pos.x,
            pos.y,
            me._container.x,
            me._container.y);

        if (dist < Consts.HandMovementOffset)
            return;

        const distance = {
            x: pos.x - me._container.x,
            y: pos.y - me._container.y
        };

        const shift = {
            x: Math.min(Math.abs(distance.x), Consts.Speed.HandFollow),
            y: Math.min(Math.abs(distance.y), Consts.Speed.HandFollow)
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

    /**
     */
    toWaitPosition() {
        const me = this;

        if (!!me.timeline)
            me._timeline.pause();

        me._sprite.setFrame(0);

        me._timeline = me._scene.tweens.timeline({
            targets: me._container,
            tweens: [{
                x: me._waitPosition.x,
                y: me._waitPosition.y,
                duration: Utils.getTweenDuration(
                    Utils.toPoint(me._container),
                    me._waitPosition,
                    Consts.Speed.HandAction),
                ease: 'Sine.easeInOut'
            }]            
        });
    }

    /**
     */
    prepareToRent() {
        const me = this;

        const point = Helper.rotate(
            Utils.buildPoint(80, 550),
            me._side);

        me._sprite.setFrame(4);

        me._timeline = me._scene.tweens.timeline({
            targets: me._container,
            tweens: [{
                x: point.x,
                y: point.y,
                duration: Utils.getTweenDuration(
                    Utils.toPoint(me._container),
                    point,
                    Consts.Speed.HandAction),
                ease: 'Sine.easeInOut'
            }]            
        });
    }

    /**
     * @returns {Boolean}
     */
    isBusy() {
        const me = this;

        return me._timeline != null 
               && me._timeline.isPlaying();
    }

    /**
     * @param {Phaser.Geom.Point} point 
     * @returns {Boolean}
     */
    isClick(point) {
        const me = this;

        return Phaser.Geom.Rectangle.ContainsPoint(
            me._container.getBounds(),
            point
        );
    }

    /**
     * @returns {Phaser.Geom.Point}
     */
    toPoint() {
        const me = this;

        return Utils.toPoint(me._container);
    }

    /**
     * @returns {Boolean}
     */
    isMaxBillCount() {
        const me = this;

        let count = 0;
        me._money.forEach((b) => count += b);
        return count >= Consts.MaxHandBillCount;
    }

    /**
     */
    hide() {
        const me = this;

        me._scene.add.tween({
            targets: me._sprite,
            alpha: { from: 1, to: 0 },
            duration: Consts.Speed.CenterEntranceDuration
        });
    }

    /**
     */
    startDark() {
        const me = this;

        Helper.toDark(me._sprite);
    }

    /**
     */
    stopDark() {
        const me = this;

        Helper.toLight(me._sprite);
    }

    _startGrabTimeline(target, callback) {
        const me = this;

        me._timeline = me._scene.tweens.timeline({
            targets: me._container,

            tweens: [
            {
                x: target.x,
                y: target.y,
                ease: 'Sine.easeInOut',
                duration: Utils.getTweenDuration(
                    Utils.toPoint(me._container),
                    target,
                    Consts.Speed.HandAction),
            },
            {
                scale: { from: 1, to: 0.75 },
                duration: Consts.Speed.HandGrabDuration / 2,
                onComplete: () => {
                    if (!!callback)
                        callback();    
                }
            },
            {
                scale: { from: 0.75, to: 1 },
                duration: Consts.Speed.HandGrabDuration / 2
            }]
        });
    }

    _validateAction(point, type, config) {
        const me = this;

        if (me.isBusy())
            return false;

        switch (type) {
            case Enums.HandAction.TAKE_DICE:
            case Enums.HandAction.TAKE_PIECE: 
                return me._canTake(config.image, point);

            case Enums.HandAction.DROP_DICES:
                return me._canDropDices(point);

            case Enums.HandAction.DROP_PIECE:
            case Enums.HandAction.CLICK_BUTTON:
            case Enums.HandAction.ADD_BILLS:
                return true;

            case Enums.HandAction.TAKE_BILL:
                return !me.isMaxBillCount();
            
            default: 
                throw `Unknown hand action ${Utils.enumToString(Enums.HandAction, type)}`;
        }
    }

    _canTake(obj, point) {
        if (!obj.visible)
            return false;

        return Phaser.Geom.Rectangle.ContainsPoint(
            obj.getBounds(), 
            point);
    }

    _canDropDices(point) {
        const me = this;

        if (me._content.length != 2)
            throw `Wrong hand content length: ${me._content.length}`;

        const zone = Consts.DiceZoneRect;
        return Phaser.Geom.Rectangle.ContainsPoint(
            new Phaser.Geom.Rectangle(zone.x, zone.y, zone.width, zone.height),
            point);
    }

    _innerTimelineCallback(point, type, config) {
        const me = this;

        switch (type) {
            case Enums.HandAction.TAKE_DICE:
            case Enums.HandAction.TAKE_PIECE:
                return me._take(config.image, config.type);

            case Enums.HandAction.DROP_DICES:
                return me._dropDices(point);

            case Enums.HandAction.DROP_PIECE: 
                return me._dropAll(point);

            case Enums.HandAction.TAKE_BILL: 
                return me._takeBill(config.index);

            case Enums.HandAction.CLICK_BUTTON:
            case Enums.HandAction.ADD_BILLS:
                return;

            default: 
                throw `Unknown hand action callback ${Utils.enumToString(Enums.HandAction, type)}`;
        }
    }

    _take(obj, type) {
        const me = this;
        
        obj.setVisible(false);
        me._content.push(obj);
        me._state = type;
        me._sprite.setFrame(2);
    }

    _dropDices(point) {
        const me = this;

        if (me._state == Enums.HandState.EMPTY)
            return;

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
        me._sprite.setFrame(0);
    }

    _dropAll(point) {
        const me = this;

        if (me._state == Enums.HandState.EMPTY)
            return;

        while (me._content.length > 0) {
            const item = me._content.pop();

            item
                .setPosition(point.x, point.y)
                .setVisible(true);
        }   

        me._state = Enums.HandState.EMPTY;
        me._sprite.setFrame(0);
    }

    _takeBill(index) {
        const me = this;

        ++me._money[index];
        me._state = Enums.HandState.MONEY;

        Utils.debugLog(`money: ${me._money.join(';')} (${Helper.getTotalMoney(me._money)})`);
    }


    _resetContentItem(index, callback, last) {
        const me = this;

        const item = me._content[index];
        const target = Utils.toPoint(item);

        item
            .setPosition(me._container.x, me._container.y)
            .setVisible(true);

        me._scene.tweens.add({
            targets: item,
            x: target.x,
            y: target.y,
            delay: index * 200,
            duration: Utils.getTweenDuration(
                Utils.toPoint(me._container),
                target,
                Consts.Speed.HandAction),
            ease: 'Sine.easeOut',
            onComplete:() => {
                if (last && !!callback)
                    callback();
            }
        });
    }

    _resetState() {
        const me = this;

        for (let i = 0; i < me._money.length; ++i)
            me._money[i] = 0;

        me._sprite.setFrame(0);
        if (!!me._timeline)
            me._timeline.stop();

        me._state = Enums.HandState.EMPTY;
    }
}