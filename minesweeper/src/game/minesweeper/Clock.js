import Phaser from '../../lib/phaser.js';
import Config from '../Config.js';
import Consts from '../Consts.js';
import Utils from '../utils/Utils.js';

export default class Clock {

    _sprite;
    _text;
    _expected;
    _delay;
    _isRunnging;
    _isAlarm;

    /** @type {Phaser.Events.EventEmitter} */
    emitter;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Number} delay 
     */
    constructor(scene, delay) {
        const me = this;

        me._delay = delay;
        me._expected = new Date().getTime();
        me._isRunnging = false;
        me._isAlarm = false;

        me._sprite = scene.add.sprite(Consts.UnitMiddle / 2, Consts.UnitMiddle / 2, 'clock', 1);
        me._text = scene.add.text(60, 65, '10.0', { fontFamily: "Arial Black", fontSize: 24, color: '#000' }).setOrigin(0.5);

        me.emitter = new Phaser.Events.EventEmitter();
    }

    reset() {
        const me = this;

        if (Utils.isDebug(Config.Debug.Timer))
            return;

        me.stop();
        me._expected = new Date().getTime() + me._delay;
        me._isRunnging = true;
        me._sprite.stop().setFrame(1);
        me._isAlarm = false;
    }

    stop() {
        const me = this;

        me._isRunnging = false;
        me._isAlarm = false;
        me._sprite.stop().setFrame(1);
    }

    update() {
        const me = this;

        if (!me._isRunnging)
            return;
            
        const now = new Date().getTime();
        const remain = now < me._expected
            ? (me._expected - now) / 1000
            : 0;

        const text = remain.toLocaleString('en-US', {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
        });
        me._text.setText(text);

        if (remain > Consts.Eps)
            return;

        me._isRunnging = false;
        me._sprite.play('clock_alarm');
        me._isAlarm = true;
        me.emitter.emit('alarm');
    }

    isRunning() {
        const me = this;
        return me._isRunnging;
    }

    isAlarm() {
        const me = this;

        return me._isAlarm;
    }
}