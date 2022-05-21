import Phaser from '../../lib/phaser.js';

import AI from '../Entities/AI.js';

import Consts from '../Consts.js';
import Enums from '../Enums.js';
import Utils from '../Utils.js';

import State from './State.js';

export default class SecondDiceTakedState extends State {

    /** 
     * @returns {Number}
     */
    getName() {
        return Enums.GameState.SECOND_DICE_TAKED;
    }

    /**
     * @param {Phaser.Geom.Point} point
     */
    processTurn(point) {
        const me = this;

        const hand = me.core.getCurrent().hand;

        hand.tryMakeAction(
            point,
            Enums.HandAction.DROP_DICES,
            null,
            () => me._startDiceDrop());
    }

    /**
     * @returns {Number}
     */
    getNextStateAfterCancel() {
        const me = this;

        return Enums.GameState.BEGIN;
    }

    /**
     */
    restoreSelection() {
        const me = this,
              context = me.core._context;

        context.dice1.unselect();
        context.dice2.unselect();
    }

    /**
     * @param {AI} ai 
     * @returns {Phaser.Geom.Point}
     */
    getAiNextPoint(ai) {
        const me = this;

        if (ai._context.status.isBusy)
            return null;

        const playerPos = me._getPlayerPiecePos(ai);

        const diceDropPos = Utils.buildPoint(
            playerPos.x + Utils.getRandom(-200, 200, 0),
            playerPos.y + Utils.getRandom(-200, 200, 0));

        const zone = Consts.DiceZoneRect;

        return Utils.buildPoint(
            Math.max(zone.x, Math.min(zone.x + zone.width, diceDropPos.x)),
            Math.max(zone.y, Math.min(zone.y + zone.height, diceDropPos.y)));
    }

    _getPlayerPiecePos(ai) {
        const playerIndex = ai._context.status.getNextPlayerIndex() != Enums.Player.HUMAN
            ? ai._context.status.player
            : Enums.Player.HUMAN;

        const piece = ai._context.pieces[playerIndex];
        return Utils.toPoint(piece.toGameObject());
    }

    _startDiceDrop() {
        const me = this;

        me.core._context.dice1.startRoll('first_dice_roll');
        me.core._context.dice2.startRoll('second_dice_roll');

        me.core._context.status.isBusy = true;

        me.core._scene.time.delayedCall(
            Utils.getRandom(1000, 2000, 1000),
            me._stopDiceDrop,
            null,
            me);
    }

    _stopDiceDrop() {
        const me = this;

        const first = Utils.getRandom(1, 6, 1);
        const second = Utils.getRandom(1, 6, 0);

        me.core._context.dice1.stopRoll(first);
        me.core._context.dice2.stopRoll(second);

        Utils.debugLog(`${first} ${second} (${first + second})`);

        me.core._context.status.isBusy = false;
        me.core._applyDiceDrop(first, second);    
    }
}