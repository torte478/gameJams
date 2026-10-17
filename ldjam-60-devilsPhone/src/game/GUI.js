import Here from "../framework/Here.js";
import Consts from "./Consts.js";
import Dungeon from "./Dungeon.js";
import LevelInfo from "./LevelInfo.js";
import Status from "./Status.js";

export default class GUI {
  /** @type {Phaser.GameObjects.Text} */
  _mainText;

  /** @type {Phaser.GameObjects.Text} */
  _topText;

  /** @type {Phaser.GameObjects.Text} */
  _leftText;

  /** @type {Phaser.GameObjects.Image} */
  _backButton;

  /** @type {Dungeon} */
  _dungeon;

  /** @type {Function} */
  _backButtonCallback;

  /** @type {Object} */
  _thisObj;

  /**
   * @param {Function} backButtonCallback
   * @param {Object} thisObj
   */
  constructor(backButtonCallback, thisObj) {
    const me = this;

    me._backButtonCallback = backButtonCallback;
    me._thisObj = thisObj;

    me._mainText = Here._.add
      .text(500, 100, "MAIN TEXT", { fontSize: 64 })
      .setOrigin(0.5, 0.5);

    me._topText = Here._.add
      .text(500, 50, "TOP TEXT", { fontSize: 48 })
      .setOrigin(0.5, 0.5);

    me._leftText = Here._.add
      .text(30, 550, "LEFT TEXT", { fontSize: 24 })
      .setOrigin(0, 0);

    me._dungeon = new Dungeon();

    me._buildBackButton();

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

  startLevelEnter(duration, toMenu) {
    const me = this;

    me._leftText.setText("");
    me._topText.setText("");
    me._mainText.setText("");
    me._backButton.setVisible(false);

    me._dungeon.moveToNextRoom(duration, toMenu);
  }

  finishLevelEnter(status) {
    const me = this;

    me.resetMainText();
    me._topText.setText(`GOAL: ${status.levelInfo.goal}`);
    me._leftText.setText(`Level: ${status.levelIndex}`);
    me._backButton.setVisible(true);
  }

  getMainText() {
    const me = this;

    return me._mainText.text.substring(1);
  }

  resetMainText() {
    const me = this;

    me._mainText.setText(">");
  }

  finishMenuEnter() {
    const me = this;

    me.resetMainText();
    me._leftText.setText("Main menu");
    me._topText.setText("SELECT LEVEL");
    me._backButton.setVisible(false);
  }

  _buildBackButton() {
    const me = this;

    me._backButton = Here._.add
      .image(900, 700, "tiles", 14)
      .setDepth(Consts.Depth.UI)
      .setVisible(false);

    me._backButton.setInteractive();

    me._backButton.on("pointerover", () => {
      me._backButton.setTint(0x7878ff);
    });

    me._backButton.on("pointerout", () => {
      me._backButton.clearTint();
    });

    me._backButton.on("pointerdown", () => {
      me._backButtonCallback.call(me._thisObj);
    });
  }
}
