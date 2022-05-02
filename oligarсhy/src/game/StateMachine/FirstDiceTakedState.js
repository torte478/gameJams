import Phaser from '../lib/phaser.js';

import AI from "../Entities/AI";

import Enums from '../Enums.js';
import Utils from '../Utils.js';

import State from './State.js';

export default class FirstDiceTakedState extends State {

    /** 
     * @returns {Number}
     */
     getName() {
        return Enums.GameState.FIRST_DICE_TAKED;
    }

    /**
     * @param {Phaser.Geom.Point} point
     */
    processTurn(point) {
        const me = this,
              context = me.core._context;

        let diceTaked = me._tryTakeDice(point, context.dice1);
        
        if (!diceTaked)
            me._tryTakeDice(point, context.dice2);
    }

    /**
     * @returns {Number}
     */
    getNextStateAfterCancel() {
        return Enums.GameState.BEGIN;
    }

    /**
     * @param {AI} ai 
     * @returns {Phaser.Geom.Point}
     */
    getAiNextPoint(ai) {
        return Utils.toPoint(ai._context.dice2.toGameObject());
    }

    _tryTakeDice(point, dice) {
        const me = this;

        const hand = me.core._getCurrent().hand;

        return hand.tryMakeAction(
            point,
            Enums.HandAction.TAKE_DICE,
            {
                image: dice.toGameObject(),
                type: Enums.HandState.DICES
            },
            () => {
                me.core._setState(Enums.GameState.SECOND_DICE_TAKED)
            });
    }
}