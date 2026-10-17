import Here from "../framework/Here.js";

export default class GUI {
  /** @type {Phaser.GameObjects.Text} */
  _mainText;

  constructor() {
    const me = this;

    me._mainText = Here._.add
      .text(500, 100, ">", { fontSize: 64 })
      .setOrigin(0.5, 0.5);
  }

  appendText(text) {
    const me = this;

    me._mainText.setText(me._mainText.text + text);
  }

  textToNumber() {
    const me = this;

    const substr = me._mainText.text.substring(1);
    if (substr.length === 0) {
      return -1;
    }

    return Number(substr);
  }
}
