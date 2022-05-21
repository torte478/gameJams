import Enums from '../Enums.js';
import Utils from '../Utils.js';

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

export default class States {

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