import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Consts from "./Consts.js";

export default class Shelf {
  /** @type {Phaser.GameObjects.Image} */
  _image;

  /** @type {Phaser.GameObjects.Text} */
  _text;

  /** @type {Phaser.GameObjects.Container} */
  _container;

  _index;

  constructor() {
    const me = this;

    me._image = Here._.add.image(
      Consts.Shelf.Width / 2,
      Consts.Shelf.Height / 2,
      "shelf",
      0
    );

    me._text = Here._.add
      .text(Consts.Shelf.Width / 2 + 2, 25, "ABCDEFG", {
        fontSize: 18,
        color: "#000000",
        fontStyle: "bold",
        fontFamily: "Archivo Black",
      })
      .setOrigin(0.5, 0.5);
    me._container = Here._.add.container(0, 0, [me._image, me._text]);
  }

  toGameObj() {
    const me = this;

    return me._container;
  }

  /** @type {Number} */
  init(index, isComplete) {
    const me = this;
    me._index = index;

    me._text.setText(Utils.intToBase26(index));
    me._image.setFrame(isComplete ? 1 : 0);
  }

  /** @type {Number} */
  getIndex() {
    const me = this;

    return me._index;
  }

  complete() {
    const me = this;

    me._image.setFrame(1);
  }
}
