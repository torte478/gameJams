import Phaser from '../lib/phaser.js';

import Here from '../framework/Here.js';
import Consts from './Consts.js';
import { SignalProcessResult } from './Models.js';

export default class Score { 

    /** @type {Phaser.GameObjects.Text} */
    _scoreText;

    /** @type {Number[]} */
    _scoreHistory;

    /** @type {Number} */
    _score;

    /** @type {Phaser.GameObjects.Text} */
    _effectText;

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
            me._runEffectTween(value, false) 
            return;
        }

        if (!signal.correct) {
            me._scoreHistory.push(0);
            return;
        }

        const value = 1;
        me._scoreHistory.push(value);
        me._score += value;

        me._runEffectTween(value, true);
    }

    updateGUI() {
        const me = this;

        me._scoreText.setText(
            ` SCORE: ${me._score < 1000 ? '0' : ''}${me._score < 100 ? '0' : ''}${me._score < 10 ? '0' : ''}${me._score} TIME: 0:00`);
    }

    _runEffectTween(value, success) {
        const me = this;

        me._effectText
            .setText(`${success ? '+' : '-'}${value}`)
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
}