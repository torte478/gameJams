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

  /** @type {Phaser.Cameras.Scene2D.Camera} */
  _scoreCamera;

  constructor(events, graph) {
    const me = this;

    me._events = events;
    me._graph = graph;

    me._scoreCamera = Here._.cameras
      .add(425, 5, 150, 100)
      .setBackgroundColor(Config.Color.Dark)
      .setScroll(-1000, -1000);

    me._score = Utils.isDebug(Config.Debug.Global) ? Config.Start.Score : 0;

    me._scoreText = Here._.add
      .text(
        me._scoreCamera.scrollX + me._scoreCamera.width / 2,
        me._scoreCamera.scrollY + me._scoreCamera.height / 2,
        me._score,
        {
          fontFamily: Config.FontFamily,
          color: Utils.colorNumberToString(Config.Color.Light),
          fontSize: 48,
        },
      )
      .setOrigin(0.5, 0.5);

    me._newTowerButton = new Button({
      x: 100,
      y: 725,
      texture: "buttons",
      frameIdle: 0,
      frameSelected: 0,
      text: "10",
      callback: () => {
        me._newTowerButtonClick();
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
      me._scoreCamera.setVisible(false);
      me._startFinalBossButton.toGameObj().setVisible(false);
    }
  }

  onScoreIncrement() {
    const me = this;

    me._score += 1;
    me._invalidateUI();
  }

  decrementScore() {
    const me = this;

    me._score -= 1;
    me._invalidateUI();
  }

  startFinalBossSequence() {
    const me = this;

    me._startFinalBossButton.toGameObj().setVisible(false);
  }

  reset() {
    const me = this;

    me._startFinalBossButton.toGameObj().setVisible(true);
  }

  showNewTowerButtonAndScore() {
    const me = this;

    me._newTowerButton.toGameObj().setVisible(true);
    me._scoreCamera.setVisible(true);
    me._newTowerButton._text.setText(Config.TowerInfo[2].cost);
  }

  _invalidateUI() {
    const me = this;

    me._scoreText.setText(me._score);

    const towersCount = Game.instance._graph._towers.length;
    const isNewTowerButtonActive =
      towersCount < Config.TowerInfo.length &&
      me._score >= Config.TowerInfo[towersCount].cost;
    me._newTowerButton.setActive(isNewTowerButtonActive);
  }

  _newTowerButtonClick() {
    const me = this;

    let towersCount = Game.instance._graph._towers.length;
    me._score -= Config.TowerInfo[towersCount].cost;

    me._events.emit(Enums.Events.NEW_TOWER_BUTTON_CLICK);

    towersCount += 1;
    const hasFutureTowers = towersCount < Config.TowerInfo.length;
    me._newTowerButton._text.setText(
      hasFutureTowers ? Config.TowerInfo[towersCount].cost : "MAX",
    );

    me._invalidateUI();

    Here.Audio.play("pointerUp");
  }
}
