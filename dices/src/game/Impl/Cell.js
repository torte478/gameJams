import Phaser from '../../lib/phaser.js';
import Consts from '../Consts.js';
import Utils from '../Utils.js';

export default class Cell {

    player;
    x;
    y;
    row;
    col;
    index;

    constructor(config) {
        const me = this;

        if (config === undefined)
            config = {};

        me.player = config.player === undefined ? Consts.Undefined : config.player;
        me.x = config.x === undefined ? Consts.Undefined : config.x;
        me.y = config.y === undefined ? Consts.Undefined : config.y;
        me.row = config.row === undefined ? Consts.Undefined : config.row;
        me.col = config.col === undefined ? Consts.Undefined : config.col;
        me.index = config.index === undefined ? Consts.Undefined : config.index;
    }

    toPoint() {
        const me = this;

        return Utils.buildPoint(me.x, me.y);
    }

    toString() {
        const me = this;
        return JSON.stringify(me);
    }
}