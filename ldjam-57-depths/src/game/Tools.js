import Here from "../framework/Here.js";
import Config from "./Config.js";
import Enums from "./Enums.js";

export default class Tools {
  /** @type {Number} */
  current;

  /** @type {Number} */
  _bagGarbageCount = 0;

  constructor() {
    const me = this;

    me.current = Enums.Tool.HAND;
  }

  update() {
    const me = this;

    let input = -1;
    if (Here.Controls.isPressedOnce(Enums.Keyboard.HAND_TOOL)) {
      input = Enums.Tool.HAND;
    } else if (Here.Controls.isPressedOnce(Enums.Keyboard.MOP_TOOL)) {
      input = Enums.Tool.MOP;
    } else if (Here.Controls.isPressedOnce(Enums.Keyboard.FIREBALL_TOOL)) {
      input = Enums.Tool.FIREBALL;
    }
    if (input === -1) return;

    me.current = input;
  }

  addGarbage() {
    const me = this;

    me._bagGarbageCount += 1;
    if (me._bagGarbageCount < Config.Player.MaxGarbageCountAtBag) {
      return false;
    }

    me._bagGarbageCount = 0;
    return true;
  }
}
