import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Boss from "./Boss.js";

import Config from "./Config.js";
import Consts from "./Consts.js";
import Edge from "./Edge.js";
import Enums from "./Enums.js";
import Graph from "./Graph.js";
import RKNMotherBrain from "./RKNMotherBrain.js";
import SignalPool from "./SignalPool.js";
import UI from "./UI.js";
import VFX from "./VFX.js";

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

  /** @type {Boolean} */
  _isCutscene = false;

  /** @type {Boolean} */
  _isRestartCutscene = false;

  /** @type {VFX} */
  _vfx;

  /** @type {Boss} */
  _boss;

  /** @type {Number} */
  _currentTime = 0;

  /** @type {Number} */
  _nextSignalRateRecalculationTime = 0;

  constructor() {
    const me = this;

    Here._.input.mouse.disableContextMenu();
    Here._.cameras.main.setBackgroundColor(Config.Color.Dark);

    const gameEvents = new Phaser.Events.EventEmitter();

    const signalPool = new SignalPool();
    me._graph = new Graph(signalPool, gameEvents);

    me._enemies = new RKNMotherBrain(me._graph);

    me._ui = new UI(gameEvents, me._graph);
    me._vfx = new VFX(me._ui);

    me._boss = new Boss();

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
    gameEvents.on(
      Enums.Events.NEW_TOWER_BUTTON_CLICK,
      me._graph.addNewTower,
      me._graph,
    );
    gameEvents.on(
      Enums.Events.START_FINAL_BOSS_CLICK,
      me._onStartFinalBossClick,
      me,
    );

    me._nextSignalRateRecalculationTime =
      Config.Time.SignalRateRecalculationPeriod;

    //===============

    Utils.ifDebug(Config.Debug.CutsceneZoom, () => {
      Here._.cameras.main.setZoom(Config.CutsceneCameraZoom);
    });

    Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
      me._log = Here._.add
        .text(10, 10, "", { fontSize: 18, backgroundColor: "#000" })
        .setScrollFactor(0)
        .setDepth(Consts.Depth.Max);
    });
  }

  update(time, deltaTime) {
    const me = this;

    me._currentTime = time;

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
        `tme: ${(me._currentTime / 1000) | 0}\n` +
        `nxt: ${me._nextSignalRateRecalculationTime / 1000}`;
      me._log.setText(text);
    });
  }

  _gameLoop(time, deltaTime) {
    const me = this;

    if (me._isCutscene) {
      return me._cutsceneUpdate();
    }

    me._graph.update(deltaTime);
    me._enemies.update();

    if (time > me._nextSignalSpawnTime) {
      me._spawnSignal();
    }

    if (time > me._nextSignalRateRecalculationTime) {
      me._recalculateEdgeRates();
    }
  }

  _recalculateEdgeRates() {
    const me = this;

    /** @type {Edge[]} */
    const edges = me._graph.recalculateEdgeRates();

    if (Utils.isDebug(Config.Debug.Global)) {
      let edgeRatingText = "rating: ";
      for (const edge of edges) {
        edgeRatingText += `(${edge.getFromId()}, ${edge.getToId()}), `;
      }

      Utils.debugLog(edgeRatingText);
    }

    me._enemies.processNextEdgeRating(edges);

    me._nextSignalRateRecalculationTime =
      me._currentTime + Config.Time.SignalRateRecalculationPeriod;
  }

  _cutsceneUpdate() {
    const me = this;

    if (me._isRestartCutscene) return;

    const damage = me._vfx.tryShotBoss();
    me._boss.applyDamage(damage);

    if (me._boss.hp <= 0) {
      throw "!!!!!!!! YOU WIN !!!!!!!!";
    }

    if (me._ui._score <= 0) {
      me._isRestartCutscene = true;

      Here._.time.delayedCall(
        Config.Time.P1_WaitBeforeStartRestartAnimaion,
        () => {
          me._runGameRestartSequence();
        },
        me,
      );
    }
  }

  _runGameRestartSequence() {
    const me = this;

    me._boss.runGameRestartSequence();

    Here._.time.delayedCall(
      Config.Time.P2_2_AllRed,
      () => {
        me._startNewGameSequence();
      },
      me,
    );
  }

  _startNewGameSequence() {
    const me = this;

    me._boss.hideRedFadeWithReset();
    me._graph.reset();
    me._ui.reset();

    Here._.cameras.main.setZoom(1);
    me._nextSignalSpawnTime = me._currentTime + Config.Time.SpawnSignalPeriodMs;
    me._isCutscene = false;
    me._isRestartCutscene = false;
  }

  _spawnSignal() {
    const me = this;

    if (me._graph.trySpawnNewSignal()) {
      me._nextSignalSpawnTime += Config.Time.SpawnSignalPeriodMs;
    }
  }

  _onStartFinalBossClick() {
    const me = this;

    me._isCutscene = true;
    me._graph.startFinalBossSequence();
    me._ui.startFinalBossSequence();
    me._boss.startFinalBossSequence();

    Here._.cameras.main.zoomTo(
      Config.CutsceneCameraZoom,
      Config.Time.P0_Zoom,
      "Sine",
      true,
    );

    Here._.time.delayedCall(
      Config.Time.P0_Zoom,
      () => {
        me._vfx.startSpawn(me._graph._towers.map((t) => t.getPos()));
      },
      null,
      me,
    );
  }
}
