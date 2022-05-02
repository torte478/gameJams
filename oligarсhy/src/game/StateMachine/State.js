import Phaser from '../lib/phaser.js';

import AI from '../Entities/AI.js';
import Context from '../Entities/Context.js';
import Cards from '../Entities/Cards.js';
import Groups from '../Entities/Groups.js'; 
import HUD from '../Entities/HUD.js';
import Player from '../Entities/Player.js';
import Timer from '../Entities/Timer.js';

import Config from '../Config.js';
import Consts from '../Consts.js';
import Enums from '../Enums.js';
import FieldInfo from '../FieldInfo.js';
import Helper from '../Helper.js';
import Utils from '../Utils.js';

import State from './State.js';
import BeginState from './BeginState.js';
import FirstDiceTakedState from './FirstDiceTakedState.js';
import SecondDiceTakedState from './SecondDiceTakedState.js';
import DiceDropedState from './DiceDropedState.js';
import PieceTakedState from './PieceTakedState.js';
import PieceOnFreeFieldState from './PieceOnFreeFieldState.js';
import PieceOnEnemyFieldState from './PieceOnEnemyFieldState.js';
import OwnFieldSelectedState from './OwnFieldSelectedState.js';
import FinalState from './FinalState.js';
import DarkState from './DarkState.js';

export default class State {

    /** @type {Core} */
    core;

    /**
     * @param {Core} core 
     */
    constructor(core) {
        const me = this;

        me.core = core;
    }

    /** 
     * @returns {Number}
     */
    getName() {
        throw 'state name getter is not implemented!';
    }

    /**
     * @param {Phaser.Geom.Point} point
     */
    processTurn(point) {
        const me = this;

        const stateStr = Utils.enumToString(Enums.GameState, me.core_context.status.state);
        throw `can't process state: ${stateStr}`;
    }

    /**
     * @returns {Number}
     */
    getNextStateAfterCancel() {
        const me = this;

        return me.core._context.status.state;
    }

    /**
     */
    showButtons() {
    }

    /**
     */
    restoreSelection() {
    }

    /**
     * @param {AI} ai 
     * @returns {Phaser.Geom.Point}
     */
    getAiNextPoint(ai) {
        const me = this;

        const stateStr = Utils.enumToString(Enums.GameState, ai._context.status.state);
        throw `CPU Error! Unknown state ${stateStr}`;
    }

    /**
     * @param {Number} state 
     * @param {Core} core 
     */
    static next(state, core) {
        switch (state) {
            case Enums.GameState.BEGIN:
                return new BeginState(core);

            case Enums.GameState.FIRST_DICE_TAKED:
                return new FirstDiceTakedState(core);

            case Enums.GameState.SECOND_DICE_TAKED:
                return new SecondDiceTakedState(core);

            case Enums.GameState.DICES_DROPED:
                return new DiceDropedState(core);

            case Enums.GameState.PIECE_TAKED:
                return new PieceTakedState(core);

            case Enums.GameState.PIECE_ON_FREE_FIELD:
                return new PieceOnFreeFieldState(core);

            case Enums.GameState.PIECE_ON_ENEMY_FIELD:
                return new PieceOnEnemyFieldState(core);

            case Enums.GameState.OWN_FIELD_SELECTED:
                return new OwnFieldSelectedState(core);

            case Enums.GameState.FINAL:
                return new FinalState(core);

            case Enums.GameState.DARK:
                return new DarkState(core);

            default:
                const stateStr = Utils.enumToString(Enums.GameState, state);
                throw `can't process state: ${stateStr}`;
        }
    }
}