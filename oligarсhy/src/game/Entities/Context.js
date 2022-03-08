import Dice from "./Dice.js";
import Fields from "./Fields.js";
import Piece from "./Piece.js";
import Player from "./Player.js";
import Status from "../Status.js";

export default class Context {

    /** @type {Status} */
    status;

    /** @type {Dice} */
    dice1;

    /** @type {Dice} */
    dice2;

    /** @type {Piece[]} */
    pieces;

    /** @type {Fields} */
    fields

    /** @type {Player[]} */
    players
}