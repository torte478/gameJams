import Phaser from '../lib/phaser.js';
import Consts from './Consts.js';

export default class Rules {

    /** @type {Array} */
    scores;

    /** @type {Number} */
    startTime;

    /** @type {Number} */
    timer;

    /** @type {Phaser.Events.EventEmitter} */
    emitter;

    /** @type {Boolean} */
    timeOut;

    /** @type {Number} */
    level;

    constructor(level) {
        const me = this;

        me.level = level;
        me.scores = [0, 0, 0, 0];
        me.startTime = new Date().getTime();
        me.emitter = new Phaser.Events.EventEmitter();
        me.timeOut = false;
    }

    update() {
        const me = this;

        me.timer = Consts.timerDuration - (new Date().getTime() - me.startTime) / 1000;

        if (!me.timeOut && me.timer <= 0) {
            me.timeOut = true;
            me.emitter.emit('timeout');
        }
    }

    updateScores(isBot, index) {
        const me = this;

        const scoreIndex = isBot
            ? index + 1
            : 0;

        me.scores[scoreIndex] += 1;
    }
}