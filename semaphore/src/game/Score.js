import Phaser from '../lib/phaser.js';

import Here from '../framework/Here.js';
import Consts from './Consts.js';
import { SignalProcessResult } from './Models.js';
import Enums from './Enums.js';

export default class Score { 

    /** @type {Phaser.GameObjects.Text} */
    _scoreText;

    /** @type {Number[]} */
    _scoreHistory;

    /** @type {Number} */
    _score;

    /** @type {Phaser.GameObjects.Text} */
    _effectText;

    /** @type {Combo} */
    _combo;

    /** @type {Phaser.GameObjects.Image} */
    _fade;

    /** @type {Menu} */
    _menu;

    /** @type {Numer} */
    _startTimeMs;

    /** @type {Numer} */
    _maxTimeMs;

    constructor() {
        const me = this;

        me._scoreHistory = [];
        me._score = 0;

        me._scoreText = Here._.add.text(
            0, 
            10 - Consts.Viewport.Height / 2, 
            ' SCORE: 0000 TIME: 0:00 ', 
            {
                fontFamily: 'Monospace',
                fontSize: 48,
                color: '#F0E2E1',
                backgroundColor:'#4A271E'
            })
            .setOrigin(0.5, 0)
            .setDepth(Consts.Depth.GUI_MAX);

        me._effectText = Here._.add.text(
            0, 
            0, 
            '+1', 
            {
                fontFamily: 'Monospace',
                fontSize: 64,
                color: '#57E402',
                fontStyle: 'bold'

            })
            .setStroke('#4A271E', 4)
            .setOrigin(0.5)
            .setDepth(Consts.Depth.GUI_MAX)
            .setAlpha(0);

        me._combo = new Combo();

        me._fade = Here._.add
            .image(0, 0, 'fade')
            .setAlpha(0)
            .setDepth(Consts.Depth.GUI_MAX);

        me._menu = new Menu();
        me._startTimeMs = new Date().getTime();
        me._maxTimeMs = 10 * 1000;
    }

    /**
     * @param {SignalProcessResult} signal 
     */
    processSignal(signal) {
        const me = this;

        if (!!signal.cancel && me._scoreHistory.length > 0) {
            const value = me._scoreHistory[me._scoreHistory.length - 1];
            me._score -= value;
            me._scoreHistory.splice(me._scoreHistory.length - 1, 1);

            if (value > 0)
                me._runEffectTween(value, false);

            me._combo.reset();
            return;
        }

        if (!signal.correct) {
            me._scoreHistory.push(0);
            me._combo.reset();
            return;
        }

        const value = me._combo.success();
        me._scoreHistory.push(value);
        me._score += value;

        me._runEffectTween(value, true);
    }

    /**
     * @param {Number} state 
     */
    updateGUI(state) {
        const me = this;

        if (state == Enums.GameState.GAME)
            me._scoreText.setText(me._buildScoreText());
        else if (state == Enums.GameState.LEVEL_COMPLETED)
            me._menu.update();
    }

    startShowResult() {
        const me = this;

        Here._.tweens.add({
            targets: me._scoreText,
            y: -500,
            duration: 500,
            ease: 'sine.in'
        });

        Here._.tweens.add({
            targets: me._fade,
            alpha: { from: 0, to: 0.75 },
            duration: 1000,
            ease: 'sine.out',
            onComplete: () => {
                const timeBonus = Math.max(
                    (me._maxTimeMs - (new Date().getTime() - me._startTimeMs)) / 100 | 0,
                    0);

                me._menu.open(me._score, timeBonus);
            }
        });
    }

    _buildScoreText() {
        const me = this;

        const res = [];
        res.push(' SCORE ');

        if (me._score < 1000)
            res.push('0');

        if (me._score < 100)
            res.push('0');

        if (me._score < 10)
            res.push('0');

        res.push(me._score.toString());

        res.push('   TIME ');

        const time = new Date().getTime() - me._startTimeMs;
        res.push(Math.floor(time / 60000).toString());
        res.push(':');

        const seconds = (time / 1000) % 60 | 0;
        if (seconds < 10)
            res.push('0');
        res.push(seconds.toString());
        res.push(' ');

        return res.join('');
    }

    _runEffectTween(value, success) {
        const me = this;

        me._effectText
            .setText(me._getEffectText(value, success))
            .setColor(success ? '#57E402' : '#E40207')
            .setAlpha(1)
            .setPosition(-40, 20 - Consts.Viewport.Height / 2);

        Here._.tweens.add({
            targets: me._effectText,
            y: -250,
            alpha: { from: 1, to: 0 },
            duration: 1000,
            ease: 'sine.inout'
        });
    }

    _getEffectText(value, success) {
        if (!success)
            return `-${value}`;

        return value == 1
            ? `+${value}`
            : `COMBO x${value}`;
    }
}

class Combo {

    /** @type {Number} */
    _durationMs;

    /** @type {Number} */
    _maxCounter;

    /** @type {Number} */
    _lastSuccessTimeMs;

    /** @type {Number} */
    _counter;

    constructor() {
        const me = this;

        me._durationMs = 4000;
        me._maxCounter = 5;

        me.reset();
    }

    reset() {
        const me = this;

        me._counter = 0;
        me._lastSuccessTimeMs = 0;
    }

    success() {
        const me = this;

        const now = new Date().getTime();
        const increaseComboCounter = me._lastSuccessTimeMs == 0 || now - me._lastSuccessTimeMs <= me._durationMs;
        me._counter = increaseComboCounter
            ?  Math.min(me._maxCounter, me._counter + 1)
            : 1;
        me._lastSuccessTimeMs = now;

        return me._counter;
    }
}

class Menu {

    /** @type {Phaser.GameObjects.Container} */
    _container;

    /** @type {Phaser.GameObjects.Text} */
    _totalText;

    /** @type {Phaser.GameObjects.Text} */
    _scoreText;

    /** @type {Phaser.GameObjects.Text} */
    _timeBonusText;

    /** @type {Number} */
    _showStartTimeMs;

    /** @type {Number} */
    _timelineIndex;

    constructor() {
        const me = this;

        me._scoreText = Here._.add.text(
            0, 
            -335, 
            'SCORE: 0', 
            {
                fontFamily: 'Arial Black',
                fontSize: 72,
                color: '#F0E2E1'
            })
            .setOrigin(0.5)
            .setStroke('#4A271E', 8)
            .setVisible(false);

        me._timeBonusText = Here._.add.text(
            0, 
            -250, 
            'TIME BONUS: 0', 
            {
                fontFamily: 'Arial Black',
                fontSize: 72,
                color: '#F0E2E1'
            })
            .setOrigin(0.5)
            .setStroke('#4A271E', 8)
            .setVisible(false);

        me._totalText = Here._.add.text(
            0, 
            -100, 
            'TOTAL: 0', 
            {
                fontFamily: 'Arial Black',
                fontSize: 128,
                color: '#F0E2E1'
            })
            .setOrigin(0.5)
            .setStroke('#4A271E', 16)
            .setVisible(false);

        me._container = Here._.add.container(0, 0, [
            me._totalText,
            me._scoreText,
            me._timeBonusText
        ])
            .setDepth(Consts.Depth.GUI_MAX);
    }

    getGameObject() {
        const me = this;

        return me._container;
    }

    open(score, timeBonus) {
        const me = this;

        me._scoreText.setText(`SCORE: ${score}`);
        me._timeBonusText.setText(`TIME BONUS: ${timeBonus}`);
        me._totalText.setText(`TOTAL: ${score + timeBonus}`);

        me._scoreText.setVisible(true);

        me._showStartTimeMs = new Date().getTime();
        me._timelineIndex = 0;
    }

    update() {
        const me = this;

        const elapsed = new Date().getTime() - me._showStartTimeMs;

        if (me._timelineIndex == 0 && elapsed > 1000) {
            me._timeBonusText.setVisible(true);
            ++me._timelineIndex;
        }

        if (me._timelineIndex == 1 && elapsed > 2000) {
            me._totalText.setVisible(true);
            ++me._timelineIndex;
        }
    }

    // посчитать time bonus
    // кнопки
    // лента
    // рестарт
}