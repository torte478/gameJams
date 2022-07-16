import Phaser from '../../lib/phaser.js';
import Config from '../Config.js';
import Consts from '../Consts.js';
import Enums from '../Enums.js';
import Utils from '../Utils.js';
import Board from './Board.js';
import Cell from './Cell.js';

import Context from './Context.js';
import Player from './Player.js';
import Players from './Players.js';

export default class AI {
    
    /** @type {Context} */
    _context;

    /** @type {Players} */
    _players;

    /** @type {Number[]} */
    _weight;

    /** @type {Player} */
    _player;

    /** @type {Board} */
    _board;

    constructor(index, context, players, board, weight) {
        const me = this;

        me._context = context;
        me._players = players;
        me._weight = weight;
        me._board = board;

        me._player = me._players._players[index];
    }

    getStep() {
        const me = this;

        const steps = me._context.availableSteps;
        const myIndex = me._player._playerIndex;
        const circleLength = me._board.getCircleLength();

        const scores = Utils.buildArray(steps.length, 0);

        for (let i = 0; i < steps.length; ++i) {
            const step = steps[i];

            /** @type {Cell} */
            const target = step.to;

            // win
            const isWin = me._board.isOwnCorner(myIndex, target)
                          && me._player._storage.length == 0
                          && me._player._pieces.filter(p => p.cell.index > circleLength).length 
                             == me._player._pieces.length - 1;
            if (isWin)
                scores[i] += me._weight[Enums.AiWeight.WIN];

            // kill
            const enemy = me._players.getPlayerAt(target);
            if (enemy !== Consts.Undefined && enemy !== myIndex)
                scores[i] += me._weight[Enums.AiWeight.KILL];

            // spawn
            const isSpawn = step.from.index === Consts.Undefined && step.to.index === 0;
            if (isSpawn)
                scores[i] += me._weight[Enums.AiWeight.SPAWN];

            // move to home
            const homeIncome = step.from.index <= circleLength && target.index > circleLength;
            if (homeIncome)
                scores[i] += me._weight[Enums.AiWeight.ENTER_HOME];

            // move inside home
            const insideHome = step.from.index > circleLength && target.index > circleLength;
            if (insideHome)
                scores[i] += me._weight[Enums.AiWeight.INSIDE_HOME];

            // move from own spawn
            if (step.from.index === 0)
                scores[i] += me._weight[Enums.AiWeight.MOVE_FROM_OWN_SPAWN];

            // move fron enemy spawn
            if (me._board.isCorner(target))
                scores[i] += me._weight[Enums.AiWeight.MOVE_FROM_ENEMY_SPAWN];
        }

        let maxIndex = 0;
        for (let i = 1; i < scores.length; ++i)
            if (scores[i] > scores[maxIndex])
                maxIndex = i;

        const maxSteps = [];
        for (let i = 0; i < scores.length; ++i)
            if (scores[i] === scores[maxIndex])
                maxSteps.push(i);

        var max = Utils.getRandomEl(maxSteps);
        
        Utils.debugLog(`scores: ${scores} => ${scores[max]} (${max})`);

        return steps[max];
    }
}