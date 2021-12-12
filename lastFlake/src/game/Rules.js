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
        [ 2, 1, 3 ],
        [ 6, 5, 7 ],
        [ 10, -1, 9 ],
        [ -1, -1, 12 ],
        [ -1, -1, -1 ]
    ];

    static headIndicies = [
        [ 0, 2, 1, 3 ],
        [ 4, 6, 5, 7 ],
        [ 8, 9, 5, 10 ],
        [ 11, 9, 5, 12 ],
        [ 13, 9, 5, 12 ]
    ];

    static outOfTime = [
        [ false, false, false, false ],
        [ false, false, false, false ],
        [ false, false, true, false ],
        [ false, true, true, false ],
        [ false, true, true, true ]
    ];

    static botPositions = [ 240, 2210, 2810 ];

    static playerSkin = [ 0, 4, 8, 11, 13 ];

    started;

    constructor(level) {
        const me = this;

        me.level = level;
        me.scores = [0, 0, 0, 0];
        me.startTime = new Date().getTime();
        me.emitter = new Phaser.Events.EventEmitter();
        me.timeOut = false;
        me.started = false;
    }

    update() {
        const me = this;

        if (!me.started)
            return;

        me.timer = Consts.timerDuration - (new Date().getTime() - me.startTime) / 1000;

        if (!me.timeOut && me.timer <= 0) {
            me.timeOut = true;
            me.emitter.emit('timeout');
        }
    }

    updateScores(isBot, index) {
        const me = this;

        if (me.timer <= 0)
            return;

        let scoreIndex
        if (isBot) {
            Rules.botSkins[me.level].forEach((x, i) => {
                if (Rules.botSkins[me.level][i] == index)
                    scoreIndex = i + 1;
            })
        } else {
            scoreIndex = 0;
        }

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

    start() {
        const me = this;
        
        me.started = true;
        me.startTime = new Date().getTime();
    }

    getBotSkinIndex(index) {
        const me = this;

        return Rules.botSkins[me.level][index];
    }
}