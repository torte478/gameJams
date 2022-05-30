import Phaser from '../../lib/phaser.js';

import AI from '../Entities/AI.js';

import Consts from '../Consts.js';
import Enums from '../Enums.js';
import Utils from '../Utils.js';

import State from './State.js';

export default class SecondDiceTakedState extends State {

    /** @type {Object} */
    _beforeDropConfig = null;

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

    /**
     */
    interupt() {
        const me = this;

        if (!me._beforeDropConfig)
            return;

        /** @type {Phaser.Time.TimerEvent} */
        const timeEvent = me._beforeDropConfig.delayed;
        timeEvent.paused = true;
        timeEvent.remove(false);

        me.core._context.dice1
            .stopRoll(me._beforeDropConfig.dice1.value)
            .setPosition(me._beforeDropConfig.dice1.pos);

        me.core._context.dice2
            .stopRoll(me._beforeDropConfig.dice2.value)
            .setPosition(me._beforeDropConfig.dice2.pos);

        me._beforeDropConfig = null;
    }

    _startDiceDrop() {
        const me = this,
              context = me.core._context;

        me._beforeDropConfig = {};
        me._beforeDropConfig.dice1 = context.dice1.getConfig();
        me._beforeDropConfig.dice2 = context.dice2.getConfig();

        me.core._context.dice1.startRoll('first_dice_roll');
        me.core._context.dice2.startRoll('second_dice_roll');

        me.core._context.status.isBusy = true;

        me._beforeDropConfig.delayed = me.core._scene.time.delayedCall(
            Utils.getRandom(1000, 2000, 1000),
            me._stopDiceDrop,
            null,
            me);
    }

    _stopDiceDrop() {
        const me = this;

        me._beforeDropConfig = null;

        const first = Utils.getRandom(1, 6, 1);
        const second = Utils.getRandom(1, 6, 0);

        me.core._context.dice1.stopRoll(first);
        me.core._context.dice2.stopRoll(second);

        Utils.debugLog(`${first} ${second} (${first + second})`);

        me.core._context.status.isBusy = false;
        me.core._applyDiceDrop(first, second);    
    }

    _getPlayerPiecePos(ai) {
        const playerIndex = ai._context.status.getNextPlayerIndex() != Enums.Player.HUMAN
            ? ai._context.status.player
            : Enums.Player.HUMAN;

        const piece = ai._context.pieces[playerIndex];
        return Utils.toPoint(piece.toGameObject());
    }
}