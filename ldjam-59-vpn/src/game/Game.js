import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";

import Config from "./Config.js";
import Consts from "./Consts.js";
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

  /** @type {VFX} */
  _vfx;

  /** @type {Number} */
  _bossHp = 0;

  constructor() {
    const me = this;

    Here._.input.mouse.disableContextMenu();

    const gameEvents = new Phaser.Events.EventEmitter();

    const signalPool = new SignalPool();
    me._graph = new Graph(signalPool, gameEvents);

    me._enemies = new RKNMotherBrain(me._graph);

    me._ui = new UI(gameEvents, me._graph);
    me._vfx = new VFX(me._ui);

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
        `mse: ${mouse.worldX | 0} ${mouse.worldY | 0}\n` + `rkn: ${me._bossHp}`;
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
  }

  _cutsceneUpdate() {
    const me = this;

    const damage = me._vfx.tryShotBoss();
    me._bossHp -= damage;

    if (me._bossHp <= 0) {
      throw "!!!!!!!! YOU WIN !!!!!!!!";
    }

    if (me._ui._score <= 0) {
      console.log("game over");
    }
  }

  _spawnSignal() {
    const me = this;

    if (me._graph.trySpawnNewSignal()) {
      me._nextSignalSpawnTime += Config.Time.SpawnSignalPeriodMd;
    }
  }

  _onStartFinalBossClick() {
    const me = this;

    me._isCutscene = true;
    me._graph.startFinalBossSequence();
    me._ui.startFinalBossSequence();

    me._bossHp = Config.BossHP;

    Here._.cameras.main.zoomTo(0.6, 1000, "Sine", true);

    Here._.time.delayedCall(
      1000,
      () => {
        me._vfx.startSpawn(me._graph._towers.map((t) => t.getPos()));
      },
      null,
      me,
    );
  }
}
