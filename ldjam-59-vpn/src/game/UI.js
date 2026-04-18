import Here from "../framework/Here.js";

export default class UI {
  /** @type {Number} */
  _score = 0;

  /** @type {Phaser.GameObjects.Text} */
  _scoreText;

  constructor() {
    const me = this;

    me._scoreText = Here._.add
      .text(400, 50, "score: 0", { fontSize: 24 })
      .setOrigin(0.5, 0.5);
  }

  onScoreIncrement() {
    const me = this;

    me._score += 1;
    me._scoreText.setText(`score: ${me._score}`);
  }
}
