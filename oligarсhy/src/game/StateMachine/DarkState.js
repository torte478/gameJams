import Phaser from '../../lib/phaser.js';
import Consts from '../Consts.js';

import Core from '../Core.js';
import Enums from '../Enums.js';

import State from './State.js';

export default class DarkState extends State {

    /** 
     * @returns {Number}
     */
    getName() {
        return Enums.GameState.DARK;
    }

    /**
     * @param {Number} delta 
     * @returns 
     */
    updateGame(delta) {
        const me = this,
              /** @type {Core} */
              core = me.core;

        if (core._timers[Enums.TimerIndex.DARK].check())
            return me._stopDark();

        me._updateDarkGame(delta);
    }

    /**
     */
    unpause() {
        const me = this,
              /** @type {Core} */
              core = me.core;

        core._timers[Enums.TimerIndex.DARK].resume();    
    }

    /**
     */
    showButtons() {
        const me = this,
            /** @type {Core} */
            core = me.core,
            players = core._context.status.activePlayers;

        for (let i = 0; i < players.length; ++i) {
            const index = players[i];
            core._context.players[index].showButtons([]);
        }
    }

    /**
     * @param {Phaser.Geom.Point} point 
     */
    processTurn(point) {
        const me = this,
              context = me.core._context,
              activePlayers = context.status.activePlayers,
              current = Enums.Player.HUMAN;

        for (let i = 0; i < activePlayers.length; ++i) {
            const enemy = activePlayers[i];

            if (enemy === current)
                continue;

            const bill = context.players[enemy].findBillIndexOnPoint(point);
            if (bill > -1)
                return me._tryStealBill(point, bill, enemy);

            if (context.players[current].isBillAreaClick(point) && context.hands[current].getTotalMoney() > 0)
                return me._addEnemyBills(context.players[enemy]);
        }        
    }

    _addEnemyBills(enemy) {
        const me = this,
              context = me.core._context,
              current = Enums.Player.HUMAN;

        const hand = context.hands[current];
        const player = context.players[current];
        const billAreaCenter = player.getBillAreaCenter();

        return hand.tryMakeAction(
            billAreaCenter,
            Enums.HandAction.ADD_BILLS,
            null,
            () => { 
                me.core._addBills(hand.dropBills(), billAreaCenter, player); 
            }
        );
    }

    _tryStealBill(point, bill, enemy) {
        const me = this,
              context = me.core._context,
              current = Enums.Player.HUMAN;

        return context.hands[current].tryMakeAction(
            point,
            Enums.HandAction.TAKE_BILL,
            { index: bill, player: enemy },
            () => { 
                context.players[enemy].removeBill(bill); 
                me.core._addMoney(-Consts.BillValue[bill], null, context.players[enemy]);
            }
        );
    }

    _stopDark() {
        const me = this,
              /** @type {Core} */
              core = me.core;

        core._graphics.showLightFade();

        core._timers[Enums.TimerIndex.LIGHT].reset();
        core._timers[Enums.TimerIndex.TURN].reset();
        core._timers[Enums.TimerIndex.DARK].pause();

        core._desk.setVisible(true);
        core._cards.stopDark();
        core._context.stopDark();

        core._setState(core._context.status.stateToReturn);
    }

    _updateDarkGame(delta) {
        const me = this,
              /** @type {Core} */
              core = me.core;

        core._moveHumanHand(delta);
    }
}