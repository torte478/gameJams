import Here from "../framework/Here.js";
import LevelInfo from "./LevelInfo.js";

export default class GUI {
  /** @type {Phaser.GameObjects.Text} */
  _mainText;

  /** @type {Phaser.GameObjects.Text} */
  _topText;

  /** @type {Phaser.GameObjects.Text} */
  _leftText;

  constructor() {
    const me = this;

    me._mainText = Here._.add
      .text(500, 100, "MAIN TEXT", { fontSize: 64 })
      .setOrigin(0.5, 0.5);

    me._topText = Here._.add
      .text(500, 50, "", { fontSize: 48 })
      .setOrigin(0.5, 0.5);

    me._leftText = Here._.add
      .text(30, 550, "SELECT LEVEL", { fontSize: 24 })
      .setOrigin(0, 0);

    me.resetMainText();
  }

  appendText(text) {
    const me = this;

    me._mainText.setText(me._mainText.text + text);
  }

  textToNumber() {
    const me = this;

    const substr = me.getMainText();
    if (substr.length === 0) {
      return -1;
    }

    return Number(substr);
  }

  /**
   * @param {Number} levelIndex
   * @param {LevelInfo} levelInfo
   */
  changeLevel(levelIndex, levelInfo) {
    const me = this;

    me.resetMainText();
    me._topText.setText(`GOAL: ${levelInfo.goal}`);
    me._leftText.setText(`Level: ${levelIndex}`);
  }

  getMainText() {
    const me = this;

    return me._mainText.text.substring(1);
  }

  resetMainText() {
    const me = this;

    me._mainText.setText(">");
  }
}
