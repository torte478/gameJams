import Button from "../framework/Button.js";
import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Config from "./Config.js";
import Enums from "./Enums.js";
import Game from "./Game.js";
import Graph from "./Graph.js";

export default class UI {
  /** @type {Number} */
  _score = 0;

  /** @type {Phaser.GameObjects.Text} */
  _scoreText;

  /** @type {Phaser.Events.EventEmitter} */
  _events;

  /** @type {Graph} */
  _graph;

  /** @type {Button} */
  _newTowerButton;

  /** @type {Button} */
  _startFinalBossButton;

  constructor(events, graph) {
    const me = this;

    me._events = events;
    me._graph = graph;

    me._score = Utils.isDebug(Config.Debug.Global) ? Config.Start.Score : 0;

    me._scoreText = Here._.add
      .text(400, 50, "score: 0", { fontSize: 24 })
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0);

    me._newTowerButton = new Button({
      x: 100,
      y: 725,
      texture: "buttons",
      frameIdle: 0,
      frameSelected: 0,
      text: "10",
      callback: () => {
        me._events.emit(Enums.Events.NEW_TOWER_BUTTON_CLICK);
      },
      callbackScope: me,
    });
    me._newTowerButton.toGameObj().setVisible(false);

    me._startFinalBossButton = new Button({
      x: 950,
      y: 750,
      texture: "newTowerButton",
      frameIdle: 2,
      frameSelected: 3,
      callback: () => {
        me._events.emit(Enums.Events.START_FINAL_BOSS_CLICK);
      },
      callbackScope: me,
    });

    if (Game.phaseId < Enums.Phase.TODO) {
      me._scoreText.setVisible(false);
      me._startFinalBossButton.toGameObj().setVisible(false);
    }
  }

  onScoreIncrement() {
    const me = this;

    me._score += 1;
    me._scoreText.setText(`score: ${me._score}`);
  }

  decrementScore() {
    const me = this;

    me._score -= 1;
    me._scoreText.setText(`score: ${me._score}`);
  }

  startFinalBossSequence() {
    const me = this;

    me._startFinalBossButton.toGameObj().setVisible(false);
  }

  reset() {
    const me = this;

    me._startFinalBossButton.toGameObj().setVisible(true);
  }

  showNewTowerButton() {
    const me = this;

    me._newTowerButton.toGameObj().setVisible(true);
  }
}
