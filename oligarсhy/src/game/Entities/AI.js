import Phaser from "../../lib/phaser.js";

import Config from "../Config.js";
import Consts from "../Consts.js";
import Enums from "../Enums.js";
import Context from "./Context.js";
import Hand from "./Hand.js";
import Player from "./Player.js";
import Utils from "../Utils.js";

export default class AI {

    /** @type {Player} */
    _player;

    /** @type {Hand} */
    _hand;

    /** @type {Context} */
    _context;

    constructor(player, hand, context) {
        const me = this;

        me._player = player;
        me._hand = hand;
        me._context = context;
    }

    nextPoint() {
        const me = this;

        if (me._context.status.isBusy)
            return null;

        switch (me._context.status.state) {
            case Enums.GameState.BEGIN:
                return Utils.toPoint(me._context.dice1.toGameObject())

            case Enums.GameState.FIRST_DICE_TAKED:
                return Utils.toPoint(me._context.dice2.toGameObject());

            case Enums.GameState.SECOND_DICE_TAKED: {

                if (me._context.status.isBusy)
                    return null;

                const zone = Consts.DiceZoneRect;

                const playerIndex = me._context.status.getNextPlayerIndex() != Enums.Player.HUMAN
                    ? me._context.status.player
                    : Enums.Player.HUMAN;

                const humanPos = Utils.toPoint(me._context.pieces[playerIndex].toGameObject());

                const randomPos = Utils.buildPoint(
                    humanPos.x + Utils.getRandom(-200, 200, 0),
                    humanPos.y + Utils.getRandom(-200, 200, 0));

                const target = Utils.buildPoint(
                    Math.max(zone.x, Math.min(zone.x + zone.width, randomPos.x)),
                    Math.max(zone.y, Math.min(zone.y + zone.height, randomPos.y)));

                return target;
            }

            case Enums.GameState.DICES_DROPED:
                return Utils.toPoint(me._context.pieces[me._context.status.player].toGameObject());

            case Enums.GameState.PIECE_TAKED:
                return me._context.fields.getFieldPosition(me._context.status.targetPieceIndex);

            case Enums.GameState.PIECE_ON_FREE_PROPERTY: {
                const cost = Config.Fields[me._context.status.targetPieceIndex].cost;
                const handMoney = me._hand.getTotalMoney();
                const diff = cost - handMoney;

                return diff > 0
                    ? me._player.getNextOptimalBillPosition(diff)
                    : me._player.getButtonPosition(Enums.ActionType.BUY_FIELD);
            }

            case Enums.GameState.PIECE_ON_ENEMY_PROPERTY: {

                const total = me._player.getBillsMoney() + me._hand.getTotalMoney();
                if (total < me._context.status.payAmount) {
                    const index = me._player.getRichestField();
                    return me._context.fields.getFieldPosition(index);
                }
                
                /** @type {Player} */
                const enemy = Utils.single(
                    me._context.players, 
                    (p) => p.hasField(me._context.status.targetPieceIndex));
                const handMoney = me._hand.getTotalMoney();
                const diff = me._context.status.payAmount - handMoney;

                return diff > 0
                    ? me._player.getNextOptimalBillPosition(diff)
                    : enemy.getButtonPosition(Enums.ActionType.UNKNOWN);
            }

            case Enums.GameState.OWN_FIELD_SELECTED:  {
                if (me._context.status.stateToReturn != Enums.GameState.PIECE_ON_ENEMY_PROPERTY)
                    throw `ai on OWN_FIELD_SELECTED from ` + 
                        `${Utils.enumToString(Enums.GameState, me._context.status.stateToReturn)} not implemented`;

                return me._player.getButtonPosition(Enums.ActionType.SELL_FIELD);
            }
                
            case Enums.GameState.FINAL:
               return me._player.getButtonPosition(Enums.ActionType.NEXT_TURN);

            default:
                const stateStr = Utils.enumToString(Enums.GameState, me._context.status.state);
                throw `CPU Error! Unknown state ${stateStr}`;
        }
    }
}