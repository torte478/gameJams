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
import Tower from "./Tower.js";
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

  /** @type {Number} */
  static phaseId;

  /** @type {Game} */
  static instance;

  constructor() {
    const me = this;

    const startPhase = Utils.isDebug(Config.Debug.Global)
      ? Config.Start.PhaseId
      : Enums.Phase.P0_START;
    Game.phaseId = startPhase;

    Here._.input.mouse.disableContextMenu();
    Here._.cameras.main.setBackgroundColor(Config.Color.Dark);

    const gameEvents = new Phaser.Events.EventEmitter();

    const signalPool = new SignalPool();
    me._graph = new Graph(signalPool, gameEvents);

    me._ui = new UI(gameEvents, me._graph);
    me._vfx = new VFX(me._ui);

    me._enemies = new RKNMotherBrain(me._graph, me._vfx);

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
    gameEvents.on(Enums.Events.SCORE_INCREMENT, me._onScoreIncrement, me);
    gameEvents.on(
      Enums.Events.NEW_TOWER_BUTTON_CLICK,
      me._onNewTowerButtonClick,
      me,
    );
    gameEvents.on(
      Enums.Events.START_FINAL_BOSS_CLICK,
      me._onStartFinalBossClick,
      me,
    );

    me._nextSignalRateRecalculationTime =
      Config.Time.SignalRateRecalculationPeriod;

    Here._.input.on("pointerdown", (pointer) => {
      me._onPointerDown(pointer);
    });

    //===============

    Utils.ifDebug(Config.Debug.CutsceneZoom, () => {
      Here._.cameras.main.setZoom(Config.CutsceneCameraZoom);
    });

    Utils.ifDebug(Config.Debug.ShowSceneLog, () => {
      me._log = Here._.add
        .text(10, 10, "", { fontSize: 18, backgroundColor: "#000" })
        .setScrollFactor(0)
        .setDepth(Consts.Depth.Max);

      me._ui._scoreCamera.ignore(me._log);
    });

    // ============================
    // ============================
    // ============================

    Game.instance = me;
    for (let phase = Enums.Phase.P0_START; phase <= startPhase; ++phase)
      me._setPhase(phase, true);
  }

  update(time, deltaTime) {
    const me = this;

    me._currentTime = time;

    if (
      Here.Controls.isPressedOnce(Enums.Keyboard.RESTART) &&
      Utils.isDebug(Config.Debug.Global)
    ) {
      Here.Audio.stopAll();
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
        `phs: ${Game.phaseId}\n` +
        `tme: ${(me._currentTime / 1000) | 0}\n` +
        `rate: ${(me._nextSignalRateRecalculationTime / 1000) | 0}\n` +
        `spwn: ${(me._nextSignalSpawnTime / 1000) | 0}`;
      me._log.setText(text);
    });
  }

  _gameLoop(time, deltaTime) {
    const me = this;

    if (Game.phaseId < Enums.Phase.P1_FIRST_CONNECT) return;

    if (me._isCutscene) {
      return me._cutsceneUpdate();
    }

    me._graph.update(deltaTime);

    if (Game.phaseId < Enums.Phase.P2_FIRST_TOWER_BUY) return;

    me._checkSignalSpawn(time);

    if (time > me._nextSignalRateRecalculationTime) {
      me._recalculateEdgeRates();
    }

    if (Game.phaseId < Enums.Phase.P4_ENEMY_ARRIVING) return;

    me._enemies.update();
  }

  _checkSignalSpawn(time) {
    const me = this;

    if (time < me._nextSignalSpawnTime) return;

    if (me._graph.trySpawnNewSignal()) {
      me._nextSignalSpawnTime += Config.Time.SpawnSignalPeriodMs;
    }
  }

  _recalculateEdgeRates() {
    const me = this;

    /** @type {Edge[]} */
    const edges = me._graph.recalculateEdgeRates();

    // if (Utils.isDebug(Config.Debug.Global)) {
    //   let edgeRatingText = "rating: ";
    //   for (const edge of edges) {
    //     edgeRatingText += `(${edge.getFromId()}, ${edge.getToId()}), `;
    //   }

    //   Utils.debugLog(edgeRatingText);
    // }

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

  _onPointerDown(pointer) {
    const me = this;

    if (Game.phaseId !== Enums.Phase.P0_START) return;

    if (
      pointer.x < 0 ||
      pointer.x > Consts.Viewport.Width ||
      pointer.y < 0 ||
      pointer.y > Consts.Viewport.Height
    )
      return;

    const isNextPhase = me._vfx.processPhase0Click();
    if (!!isNextPhase) {
      me._setPhase(Enums.Phase.P1_FIRST_CONNECT);
    }
  }

  /**
   * @param {Tower} tower
   */
  _onScoreIncrement(tower) {
    const me = this;

    me._ui.onScoreIncrement();
    me._vfx.plusOneParticles(tower.getPos());

    if (Game.phaseId !== Enums.Phase.P1_FIRST_CONNECT) return;

    me._setPhase(Enums.Phase.P2_FIRST_TOWER_BUY);
  }

  _onNewTowerButtonClick() {
    const me = this;

    me._graph.addNewTower();

    if (
      Game.phaseId === Enums.Phase.P2_FIRST_TOWER_BUY &&
      me._graph._towers.length === 4
    ) {
      me._setPhase(Enums.Phase.P3_REMOVE_EDGE);
      return;
    }

    if (
      Game.phaseId === Enums.Phase.P3_REMOVE_EDGE &&
      me._graph._towers.length === 5
    ) {
      me._setPhase(Enums.Phase.P4_ENEMY_ARRIVING);
      return;
    }
  }

  _setPhase(phaseId, doQuickly) {
    const me = this;

    Game.phaseId = phaseId;
    Utils.debugLog(`!!! Next phase: ${phaseId} !!!`);

    if (phaseId === Enums.Phase.P0_START) {
      // do nothing
      return;
    }

    if (phaseId === Enums.Phase.P1_FIRST_CONNECT) {
      const towerA = me._graph._towers[0];
      towerA.addSignal(me._graph._signalPool.create(0, 1));
      me._ui._invalidateUI();
      return;
    }

    if (phaseId === Enums.Phase.P2_FIRST_TOWER_BUY) {
      Here.Audio.play("musicRadio", { loop: true });

      me._nextSignalSpawnTime =
        me._currentTime + Config.Time.SpawnSignalPeriodMs;
      me._nextSignalRateRecalculationTime =
        me._currentTime + Config.Time.SignalRateRecalculationPeriod;

      let beforeTentacleDuration = 3000;
      if (!!doQuickly) beforeTentacleDuration /= 10;
      Here._.time.delayedCall(
        Utils.getDurationMaybeQuick(beforeTentacleDuration),
        () => me._vfx.tenctacleVpnTitle(doQuickly),
        null,
        me,
      );

      if (me._graph._edges.length == 0) {
        me._graph._tryAddEdge(me._graph._towers[0], me._graph._towers[1]);
      }

      return;
    }

    if (phaseId === Enums.Phase.P3_REMOVE_EDGE) {
      let beforeTentacleDuration = 1000;
      if (!!doQuickly) beforeTentacleDuration /= 10;
      Here._.time.delayedCall(
        Utils.getDurationMaybeQuick(beforeTentacleDuration),
        () => me._vfx.tenctacleConnectHint(doQuickly),
        null,
        me,
      );

      while (me._graph._towers.length < 4) {
        me._graph.addNewTower();
      }

      return;
    }

    if (phaseId === Enums.Phase.P4_ENEMY_ARRIVING) {
      me._enemies.spawnFirstEnemy();

      if (!!doQuickly) {
        me._graph._tryAddEdge(me._graph._towers[0], me._graph._towers[2]);
        me._graph._tryAddEdge(me._graph._towers[0], me._graph._towers[3]);
        me._graph._tryAddEdge(me._graph._towers[2], me._graph._towers[1]);
        me._graph._tryAddEdge(me._graph._towers[3], me._graph._towers[1]);
      }
      return;
    }

    throw `unknown phase ${phaseId}`;
  }
}
