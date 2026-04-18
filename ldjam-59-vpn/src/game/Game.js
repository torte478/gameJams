import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";

import Config from "./Config.js";
import Consts from "./Consts.js";
import Edge from "./Edge.js";
import Enums from "./Enums.js";
import Graph from "./Graph.js";
import RKNMotherBrain from "./RKNMotherBrain.js";
import SignalPool from "./SignalPool.js";
import UI from "./UI.js";

export default class Game {
  /** @type {Phaser.GameObjects.Text} */
  _log;

  /** @type {Graph} */
  _graph;

  /** @type {RKNMotherBrain} */
  _enemies;

  /** @type {UI} */
  _ui;

  /** @type {Number} */
  _nextSignalSpawnTime = 0;

  constructor() {
    const me = this;

    Here._.input.mouse.disableContextMenu();

    const gameEvents = new Phaser.Events.EventEmitter();

    me._ui = new UI();

    const signalPool = new SignalPool();
    me._graph = new Graph(signalPool, gameEvents);

    me._enemies = new RKNMotherBrain(me._graph);

    //==========

    gameEvents.on(
      Enums.Events.EDGE_ADDED,
      me._enemies.onEdgeAdded,
      me._enemies,
    );
    gameEvents.on(
      Enums.Events.EDGE_REMOVED,
      me._enemies.onEdgeRemoved,
      me._enemies,
    );
    gameEvents.on(
      Enums.Events.SCORE_INCREMENT,
      me._ui.onScoreIncrement,
      me._ui,
    );

    //===============

    Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
      me._log = Here._.add
        .text(10, 10, "", { fontSize: 18, backgroundColor: "#000" })
        .setScrollFactor(0)
        .setDepth(Consts.Depth.Max);
    });
  }

  update(time, deltaTime) {
    const me = this;

    if (
      Here.Controls.isPressedOnce(Enums.Keyboard.RESTART) &&
      Utils.isDebug(Config.Debug.Global)
    ) {
      Here._.scene.restart({ isRestart: true });
    }

    if (
      Here.Controls.isPressedOnce(Enums.Keyboard.MAIN_ACTION) &&
      Utils.isDebug(Config.Debug.Global)
    ) {
      me._graph.trySpawnNewSignal();
    }

    //=================
    me._gameLoop(time, deltaTime);
    //=================

    Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
      const mouse = Here._.input.activePointer;

      let text =
        `mse: ${mouse.worldX | 0} ${mouse.worldY | 0}\n` +
        `twr: ${!!me._graph._selectedTower}`;
      me._log.setText(text);
    });
  }

  _gameLoop(time, deltaTime) {
    const me = this;

    me._graph.update(deltaTime);
    me._enemies.update();

    if (time > me._nextSignalSpawnTime) {
      me._spawnSignal();
    }
  }

  _spawnSignal() {
    const me = this;

    if (me._graph.trySpawnNewSignal()) {
      me._nextSignalSpawnTime += Config.Time.SpawnSignalPeriodMd;
    }
  }
}
