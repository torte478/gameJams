import Phaser from '../../lib/phaser.js';

import Config from '../Config.js';
import Consts from '../Consts.js';
import Enums from '../Enums.js';
import Utils from '../Utils.js';
import Board from './Board.js';
import Carousel from './Carousel.js';
import Cell from './Cell.js';
import Context from './Context.js';
import Player from './Player.js';

export default class Players {
    
    /** @type {Player[]} */
    _players;

    /** @type {Context} */
    _context;

    /**
     * @param {Phaser.Scene} scene 
     * @param {Board}
     */
    constructor(scene, board, context, carousel, players) {
        const me = this;

        me._players = players.map(
            (config, index) => new Player(scene, board, index, carousel, config));

        me._context = context;
    }

    /**
     * @param {Number} value 
     * @returns {Object[]}
     */
    getAvailableSteps(value) {
        const me = this;

        return me._getCurrent().getAvailableSteps(value);
    }

    /**
     * @param {Object} step
     * @param {Function} callback
     * @param {Object} context
     */
    makeStep(step, callback, context) {
        const me = this;

        me._getCurrent().makeStep(step, callback, context);
    }

    tryKill(cell, callback, context) {
        const me = this;

        for (let i = 0; i < me._players.length; ++i) {
            if (i == me._context.player)
                continue;

            if (me._players[i].tryKill(cell, callback, context))
                return true;
        }

        return false;
    }

    isStorageClick(point) {
        const me = this;

        return me._getCurrent().isStorageClick(point);
    }

    /**
     * @param {Cell} target 
     */
    getPlayerAt(target) {
        const me = this;

        for (let i = 0; i < me._players.length; ++i)
            if (me._players[i].hasPieceAt(target))
                return i;

        return Consts.Undefined;
    }

    findWnner() {
        const me = this;

        return Utils.firstIndexOrNull(me._players, p => p.isWinner());
    }

    disableBooster() {
        const me = this;

        return me._getCurrent().disableBooster();
    }

    applyBooster(value) {
        const me = this;

        return me._getCurrent().applyBooster(value);
    }

    getBoosterValues() {
        const me = this;

        return me._getCurrent().getBoosterValues();
    }

    applyCycleBooster() {
        const me = this;

        return me._getCurrent().applyCycleBooster();
    }

    _getCurrent() {
        const me = this;

        return me._players[me._context.player];
    }
}