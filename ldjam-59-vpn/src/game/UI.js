import Button from "../framework/Button.js";
import Here from "../framework/Here.js";
import Config from "./Config.js";
import Enums from "./Enums.js";
import Graph from "./Graph.js";

export default class UI {
  /** @type {Number} */
  _score = 0;

  /** @type {Phaser.GameObjects.Text} */
  _scoreText;

  /** @type {Phaser.Events.EventEmitter} */
  _events;

  /** @type {Button} */
  _newTowerButton;

  /** @type {Graph} */
  _graph;

  constructor(events, graph) {
    const me = this;

    me._events = events;
    me._graph = graph;

    me._scoreText = Here._.add
      .text(400, 50, "score: 0", { fontSize: 24 })
      .setOrigin(0.5, 0.5);

    me._newTowerButton = new Button({
      x: 100,
      y: 700,
      texture: "newTowerButton",
      frameIdle: 0,
      frameSelected: 1,
      callback: () => {
        me._events.emit(Enums.Events.NEW_TOWER_BUTTON_CLICK);
        me._invalidateButtonsVisibility();
      },
      callbackScope: me,
    });
    me._invalidateButtonsVisibility();
  }

  onScoreIncrement() {
    const me = this;

    me._score += 1;
    me._scoreText.setText(`score: ${me._score}`);

    me._invalidateButtonsVisibility();
  }

  _invalidateButtonsVisibility() {
    const me = this;

    const isButtonVisible =
      me._score >= Config.NewTowerCost &&
      me._graph._towers.length < Config.TowerPositions.length;

    me._newTowerButton.toGameObj().setVisible(isButtonVisible);
  }
}
