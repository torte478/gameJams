import Here from "../framework/Here.js";
import Player from "./Player.js";

export default class Trigger {
  /**
   * @param {Player} player
   * @param {Number} x
   * @param {Number} y
   * @param {Number} width
   * @param {Number} height
   * @param {Function} func
   * @param {Object} thisArg
   */
  constructor(player, x, y, width, height, func, thisArg) {
    const me = this;

    const zone = Here._.add.zone(x, y, width, height).setOrigin(0, 0);
    Here._.physics.add.existing(zone, true);
    zone.body.moves = false;

    Here._.physics.add.overlap(zone, player.toGameObject(), (z, p) => {
      zone.destroy();

      if (!!func) func.call(thisArg);
    });
  }
}
