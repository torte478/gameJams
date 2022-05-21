import Phaser from '../../lib/phaser.js';
import Core from '../Core.js';

import AI from '../Entities/AI.js';

import Enums from '../Enums.js';

import State from './State.js';

export default class FinalState extends State {

    /** 
     * @returns {Number}
     */
    getName() {
        return Enums.GameState.FINAL;
    }

    /**
     * @param {Phaser.Geom.Point} point
     */
    processTurn(point) {
        const me = this,
              player = me.core.getCurrent().player;

        if (player.canClickButton(point, Enums.ActionType.NEXT_TURN))
            return me.core._finishTurn();

        me.core._tryManageMoney(point)
    }

    /**
     */
    showButtons() {
        const me = this,
              player = me.core.getCurrent().player;

        player.showButtons([Enums.ActionType.NEXT_TURN]);
    }

    /**
     */
    restoreSelection() {
        const me = this,
              /** @type {Core} */
              core = me.core;

        core._context.fields.unselectAll();
    }

    /**
     * @param {AI} ai 
     * @returns {Phaser.Geom.Point}
     */
    getAiNextPoint(ai) {
        const me = this;

        return ai._tryManage();
    }
}