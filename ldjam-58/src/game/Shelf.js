import Here from "../framework/Here.js";
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

    me._image = Here._.add.image(Consts.Shelf.Width / 2, 0, "shelf", 0);
    me._text = Here._.add.text(Consts.Shelf.Width / 2, -60, "TEST", {
      fontSize: 32,
      color: "#000000",
    });
    me._container = Here._.add.container(0, 0, [me._image, me._text]);
  }

  toGameObj() {
    const me = this;

    return me._container;
  }

  /** @type {Number} */
  init(index) {
    const me = this;
    me._index = index;
    me._text.setText(index);
  }

  /** @type {Number} */
  getIndex() {
    const me = this;

    return me._index;
  }
}
