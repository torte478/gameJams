import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Config from "./Config.js";
import Consts from "./Consts.js";

export default class Signal {
  /** @type {Phaser.GameObjects.Container} */
  _container;

  /** @type {Phaser.GameObjects.Text} */
  _labelText;

  /** @type {Number} */
  uid;

  /** @type {Number} */
  fromTowerId = -1;

  /** @type {Number} */
  toTowerId = -1;

  static _uid_counter = 1;

  constructor() {
    const me = this;

    me.uid = Signal._uid_counter++;

    me._labelText = Here._.add
      .text(0, 0, "X", {
        fontSize: 24,
        fontFamily: Config.FontFamily,
        color: Utils.colorNumberToString(Config.Color.Dark),
      })
      .setOrigin(0.5, 0.5);
    const image = Here._.add.image(0, 0, "signal");

    me._container = Here._.add
      .container(0, 0, [image, me._labelText])
      .setVisible(false)
      .setDepth(Consts.Depth.Signal);
  }

  init(fromTowerId, toTowerId) {
    const me = this;

    if (fromTowerId === toTowerId || fromTowerId < 0 || toTowerId < 0) {
      throw `all broken! ${fromTowerId} ${toTowerId}`;
    }

    me.fromTowerId = fromTowerId;
    me.toTowerId = toTowerId;

    me._labelText.setText(Utils.indexToLetter(me.toTowerId));
  }

  /**
   * @returns {Phaser.GameObjects.Container}
   */
  toGameObj() {
    const me = this;

    return me._container;
  }

  getPos() {
    const me = this;

    return Utils.toPoint(me._container);
  }
}
