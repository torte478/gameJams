import Dice from "./Dice.js";
import Fields from "./Fields.js";
import Piece from "./Piece.js";
import Player from "./Player.js";
import Status from "../Status.js";
import Hand from "./Hand.js";

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
}