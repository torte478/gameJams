import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Enums from "./Enums.js";

export default class Stratagem {

    /** @type {Phaser.GameObjects.Text} */
    _statusText;

    /** @type {Phaser.GameObjects.Sprite[]} */
    _arrows = [];

    /** @type {Phaser.Geom.Point} */
    _pos;

    /** @type {Phaser.Events.EventEmitter} */
    _events;

    _index;

    /** @type {Phaser.GameObjects.Image} */
    _fade;

    _cost;

    _cooldown;

    _cooldownEnd = new Date().getTime();

    _descText;

    _miss = false;

    constructor(index, events) {
        const me = this;

        me._events = events;
        me._index = index;

        const panel = Here._.add.image(4150, 100 + index * 105, 'panel')
        me._pos = Utils.toPoint(panel);
        
        Here._.add.image(panel.x + 100, panel.y - 10, 'stratagems', index).setScale(0.75);

        me._statusText = Here._.add.text(panel.x + 135, panel.y + 20, '12.5s', { fontSize: 20, fontStyle: 'bold'})
            .setOrigin(1, 0,5);

        me._descText = Here._.add.text(panel.x - 135, panel.y - 25, 'TEST TEST TEST', {fontSize: 20, fontStyle: 'bold', fontFamily: 'Tahoma'})
            .setOrigin(0, 0.5);

        me._init(index);

        me._fade = Here._.add.image(me._pos.x, me._pos.y, 'panel', 1).setAlpha(0.5).setVisible(false);
    }

    isAvaialbe() {
        const me = this;

        return !me._fade.visible && new Date().getTime() > me._cooldownEnd &&!me._misss;
    }

    updateArrow(arrowIndex, arrow) {
        const me = this;

        if (arrowIndex >= me._arrows.length) {
            me._miss = true;
            return Enums.StratagemResult.MISS;
        }
            
        const arrowSprite = me._arrows[arrowIndex];
        if (arrowSprite.direction != arrow) {
            me._clearArrows();
            me._fade.setVisible(true);
            me._miss = true;
            return Enums.StratagemResult.MISS;
        }

        if (arrowIndex == me._arrows.length - 1) {
            me._cooldownEnd = new Date().getTime() + me._cooldown * 1000;
            me._events.emit('stratagemSummon', me._index);
            return Enums.StratagemResult.COMPLETE;
        } 
            
        arrowSprite.setFrame(1);
        return Enums.StratagemResult.HIT;
    }

    reset(total) {
        const me = this;

        me._miss = false;
        me._clearArrows();
    }

    updateTimer(total) {
        const me = this;

        const now = new Date().getTime();
        const diff = me._cooldownEnd - now;
        const text = diff > 0
            ? `${parseFloat(diff / 1000).toFixed(1).toLocaleString('en')}s`
            : `${me._cost}¤`;

        me._statusText.setText(text);

        const isFaded = (total < me._cost) || (now < me._cooldownEnd) || me._miss;
        if (me._fade.visible != isFaded)
            me._fade.setVisible(isFaded);
    }

    _clearArrows() {
        const me = this;

        for (let i = 0; i < me._arrows.length; ++i)
            me._arrows[i].setFrame(0);
    }

    _init(index) {
        const me = this;

        if (index == Enums.StratagemType.WIN_THE_GAME)
            me._initInternal(
                'WIN THE GAME', 
                4000,
                1000,
                [Enums.Arrow.UP, Enums.Arrow.DOWN, Enums.Arrow.LEFT, Enums.Arrow.LEFT, Enums.Arrow.RIGHT]);

        if (index == Enums.StratagemType.SHIELD)
            me._initInternal(
                "SHIELD", 
                100,
                15,
                [Enums.Arrow.LEFT, Enums.Arrow.LEFT, Enums.Arrow.DOWN]);

        if (index == Enums.StratagemType.GUN)
            me._initInternal(
                "GUN", 
                200,
                30,
                [Enums.Arrow.DOWN, Enums.Arrow.RIGHT, Enums.Arrow.DOWN, Enums.Arrow.LEFT]);

        if (index == Enums.StratagemType.MORE_DIVERS)
            me._initInternal(
                "MORE DIVERS", 
                100,
                60,
                [Enums.Arrow.DOWN, Enums.Arrow.DOWN, Enums.Arrow.UP, Enums.Arrow.LEFT]);

        if (index == Enums.StratagemType.WITHOUT_CHANGE)
            me._initInternal(
                "NO CHANGE", 
                120,
                45,
                [Enums.Arrow.LEFT, Enums.Arrow.UP, Enums.Arrow.LEFT, Enums.Arrow.UP, Enums.Arrow.RIGHT]);

        if (index == Enums.StratagemType.DIVERS_SPEED)
            me._initInternal(
                "DIVER SPEED", 
                200,
                60,
                [Enums.Arrow.UP, Enums.Arrow.LEFT, Enums.Arrow.DOWN, Enums.Arrow.RIGHT, Enums.Arrow.UP]);

        if (index == Enums.StratagemType.FIX_BUGS)
            me._initInternal(
                "FIX BUGS =)",
                0,
                3,
                [Enums.Arrow.RIGHT, Enums.Arrow.RIGHT, Enums.Arrow.UP]);
    }

    _initInternal(descStr, cost, cooldown, directions) {
        const me = this;

        me._cost = cost;
        me._cooldown = cooldown;
        me._descText.setText(descStr);
        for (let i = 0; i < directions.length; ++i) {
            const arrow = Here._.add.sprite(me._pos.x - 125 + i * 38, me._pos.y + 20, 'arrows', 0);
            arrow.direction = directions[i];
            arrow.setAngle(me._getAngle(directions[i]));
            me._arrows.push(arrow);
        }
    }

    _getAngle(direction) {
        const me = this;

        if (direction == Enums.Arrow.UP)
            return 0;
        if (direction == Enums.Arrow.LEFT)
            return -90;
        if (direction == Enums.Arrow.DOWN)
            return 180;
        if (direction == Enums.Arrow.RIGHT)
            return 90;

        throw `unknown direction ${direction}`;
    }
}