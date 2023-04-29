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

    constructor() {
        const me = this;

        me._scoreHistory = [];
        me._score = 0;

        me._scoreText = Here._.add.text(
                0, 
                10 - Consts.Viewport.Height / 2, ' SCORE: 0000 TIME: 0:00 ', {
            fontFamily: 'Monospace',
            fontSize: 48,
            color: '#F0E2E1',
            backgroundColor:'#4A271E'
            })
            .setOrigin(0.5, 0)
            .setDepth(Consts.Depth.GUI_MAX);
    }

    /**
     * @param {SignalProcessResult} signal 
     */
    processSignal(signal) {
        const me = this;

        if (signal.correct) {
            me._scoreHistory.push(1);
            me._score += 1;
        }
        else
            me._scoreHistory.push(0);
    }

    updateGUI() {
        const me = this;

        me._scoreText.setText(
            ` SCORE: ${me._score < 1000 ? '0' : ''}${me._score < 100 ? '0' : ''}${me._score < 10 ? '0' : ''}${me._score} TIME: 0:00`);
    }
}