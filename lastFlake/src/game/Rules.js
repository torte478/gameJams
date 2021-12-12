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

    static botAvailable = [
        [ true, true, true ],
        [ true, true, true ],
        [ true, false, true ],
        [ false, false, true ],
        [ false, false, false ]
    ];

    static botSkins = [
        [ 1, 2, 3 ],
        [ 5, 6, 7 ],
        [ 9, -1, 10 ],
        [ -1, -1, 12 ],
        [ -1, -1, -1 ]
    ];

    static headIndicies = [
        [ 0, 1, 2, 3 ],
        [ 4, 5, 6, 7 ],
        [ 8, 5, 9, 10 ],
        [ 11, 5, 9, 12 ],
        [ 13, 5, 9, 12 ]
    ];

    static outOfTime = [
        [ false, false, false, false ],
        [ false, false, false, false ],
        [ false, true, false, false ],
        [ false, true, true, false ],
        [ false, true, true, true ]
    ];

    static botPositions = [ 240, 2210, 2810 ];

    static playerSkin = [ 0, 4, 8, 11, 13 ];

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

    getBotConfigs() {
        const me = this;

        const res = [];
        for (let i = 0; i < Rules.botPositions.length; ++i){
            if (Rules.botAvailable[me.level][i])
                res.push({
                    x: Rules.botPositions[i],
                    skin: Rules.botSkins[me.level][i]
                });
        }

        return res;
    }

    getPlayerSkin() {
        const me = this;

        return Rules.playerSkin[me.level];
    }

    getHeadInidices() {
        const me = this;

        return Rules.headIndicies[me.level];
    }

    getOutOfTime() {
        const me = this;

        return Rules.outOfTime[me.level];
    }
}