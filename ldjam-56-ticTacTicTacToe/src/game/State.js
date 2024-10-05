import Chunk from "./Chunk.js";
import Config from "./Config.js";

export default class State {
  /** @type {Chunk} */
  chunk;

  /** @type {Number} */
  side;

  /** @type {Number} */
  layer;

  /** @type {Boolean} */
  isInputEnabled;

  /** @type {Number[]} */
  path;

  constructor(chunk) {
    const me = this;

    me.chunk = chunk;
    me.side = Config.Init.Side;
    me.layer = 0;
    me.isInputEnabled = true;
    me.path = [];
  }
}
