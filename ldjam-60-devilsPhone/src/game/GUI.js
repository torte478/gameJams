import Here from "../framework/Here.js";

export default class GUI {
  /** @type {Phaser.GameObjects.Text} */
  _mainText;

  constructor() {
    const me = this;

    me._mainText = Here._.add
      .text(500, 150, "?", { fontSize: 32 })
      .setOrigin(0.5, 0.5);
  }

  setText(text) {
    const me = this;

    me._mainText.setText(me._mainText.text + text);
  }
}
