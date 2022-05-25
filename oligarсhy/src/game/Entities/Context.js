import Dice from "./Dice.js";
import Fields from "./Fields.js";
import Piece from "./Piece.js";
import Player from "./Player.js";
import Status from "../Status.js";
import Hand from "./Hand.js";
import Config from "../Config.js";

export default class Context {

    /** @type {Dice} */
    dice1;

    /** @type {Dice} */
    dice2;

    /** @type {Fields} */
    fields;

    /** @type {Hand[]} */
    hands;

    /** @type {Piece[]} */
    pieces;

    /** @type {Player[]} */
    players;

    /** @type {Status} */
    status;

    /**
     */
    startDark() {
        const me = this;

        me.dice1.hide();
        me.dice2.hide();
        me.fields.startDark();
        
        for (let i = 0; i < me.status.activePlayers.length; ++i) {
            const player = me.status.activePlayers[i];
            me.hands[player].startDark();
            me.pieces[player].startDark();
            me.players[player].startDark();
        }
    }

    /**
     */
    stopDark() {
        const me = this;

        me.dice1.show();
        me.dice2.show();
        me.fields.stopDark();

        for (let i = 0; i < me.status.activePlayers.length; ++i) {
            const player = me.status.activePlayers[i];
            me.hands[player].stopDark();
            me.pieces[player].stopDark();
            me.players[player].stopDark();
        }
    }
}