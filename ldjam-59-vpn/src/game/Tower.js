import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Config from "./Config.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";
import Game from "./Game.js";
import Graph from "./Graph.js";
import Signal from "./Signal.js";
import SignalPool from "./SignalPool.js";

export default class Tower {
  /** @type {Number} */
  id;

  /** @type {Phaser.GameObjects.Sprite} */
  _sprite;

  /** @type {Phaser.GameObjects.Container} */
  _container;

  /** @type {Signal[]} */
  _signalQueue = [];

  /** @type {Phaser.GameObjects.Text} */
  _signalQueueText;

  /** @type {SignalPool} */
  _signalPool;

  /** @type {Phaser.Events.EventEmitter} */
  _events;

  /** @type {Boolean} */
  _isAutoMode = true;

  /** @type {Phaser.GameObjects.PointLight} */
  _light;

  /**
   * @param {Number} id
   * @param {Number} x
   * @param {Number} y
   * @param {String} label
   * @param {Phaser.Events.EventEmitter} events
   */
  constructor(id, x, y, label, signalPool, events) {
    const me = this;

    me.id = id;
    me._signalPool = signalPool;
    me._events = events;

    if (Utils.isDebug(Config.Debug.Global)) {
      me._isAutoMode = Config.Debug.AutoMode;
    }

    me._sprite = Here._.add.sprite(0, 0, "tower", 0);
    if (me._isAutoMode) {
      me._sprite.play("tower_idle");
    }

    me._light = Here._.add.pointlight(
      -1,
      -25,
      Config.Color.TowerLight.Green,
      30,
      0.1,
    );

    const labelText = Here._.add
      .text(1, 33, label, {
        fontSize: 18,
        fontFamily: Config.FontFamily,
        color: Utils.colorNumberToString(Config.Color.Light),
      })
      .setOrigin(0.5, 0.5);
    me._signalQueueText = Here._.add
      .text(50, 0, "[]", { fontSize: 20 })
      .setVisible(false);
    if (Utils.isDebug(Config.Debug.SignalQueueView)) {
      me._signalQueueText.setVisible(true);
    }

    me._container = Here._.add.container(x, y, [
      me._sprite,
      labelText,
      me._light,
      me._signalQueueText,
    ]);

    me._container
      .setDepth(Consts.Depth.Tower)
      .setSize(me._sprite.width, me._sprite.height)
      .setInteractive()
      .on("pointerover", () => {
        if (Game.phaseId === Enums.Phase.P0_START) return;

        me._sprite.setTint(Config.Color.Green);
      })
      .on("pointerout", () => {
        me._sprite.clearTint();
      });

    me._invalidateSignalQueueVisual();
  }

  toGameObj() {
    const me = this;

    return me._container;
  }

  getPos() {
    const me = this;

    return Utils.buildPoint(me._container.x, me._container.y + 30);
  }

  toggleMode() {
    const me = this;

    if (me._isAutoMode) {
      me._isAutoMode = false;
      me._sprite.stop().setFrame(0);
    } else {
      me._isAutoMode = true;
      me._sprite.play("tower_idle");
    }
  }

  /**
   * @param {Phaser.Math.Vector2} pos
   * @returns {Boolean}
   */
  containsPoint(pos) {
    const me = this;

    return Phaser.Geom.Rectangle.ContainsPoint(me._container.getBounds(), pos);
  }

  /**
   * @param {Signal} signal
   */
  addSignal(signal) {
    const me = this;

    if (!me.hasRoom) throw `tower ${me.id} is full!`;

    if (signal.toTowerId === me.id) {
      return me._processSignalArrived(signal);
    }

    signal
      .toGameObj()
      .setPosition(me._container.x, me._container.y)
      .setVisible(false);

    me._signalQueue.push(signal);
    me._invalidateSignalQueueVisual();
    me._events.emit(Enums.Events.TOWER_SIGNAL_CHANGE, me);
  }

  /**
   * @param {Graph} graph
   * @returns
   */
  updateSignals(graph) {
    const me = this;

    if (me._signalQueue.length === 0 || !me._isAutoMode) {
      return;
    }

    const signalsToDelete = [];
    for (const signal of me._signalQueue) {
      const edgeToSend = graph.getEdgeToSend(
        me.id,
        signal.toTowerId,
        signal.toTowerId,
      );
      if (!edgeToSend) continue;

      signalsToDelete.push(signal.uid);
      edgeToSend.sendSignal(me.id, signal);
    }

    if (signalsToDelete.length > 0) {
      me._signalQueue = me._signalQueue.filter(
        (s) => !Utils.contains(signalsToDelete, s.uid),
      );
      me._invalidateSignalQueueVisual();
      me._events.emit(Enums.Events.TOWER_SIGNAL_CHANGE, me);
    }
  }

  /**
   *
   * @param {Number} index
   * @returns {Signal}
   */
  getSignalByIndex(index) {
    const me = this;

    if (index >= me._signalQueue.length) throw "wrong signal index at queue";

    const signal = me._signalQueue[index];
    // me.removeSignalByIndex(index);
    return signal;
  }

  getSignalByIndexAndRemove(index) {
    const me = this;

    if (index >= me._signalQueue.length) throw "wrong signal index at queue";

    const signal = me._signalQueue[index];
    me.removeSignalByIndex(index);
    return signal;
  }

  hasRoom() {
    const me = this;

    return me._signalQueue.length < Config.MaxSignalPerTower;
  }

  startFinalBossSequence() {
    const me = this;

    me._sprite.play("tower_transform");
  }

  reset() {
    const me = this;

    for (const signal of me._signalQueue) {
      me._signalPool.release(signal);
    }

    me._signalQueue = [];
    me._invalidateSignalQueueVisual();

    me._isAutoMode = true;
    me._sprite.setFrame(0);
  }

  removeSignalByIndex(index) {
    const me = this;

    if (me._signalQueue.length < index) throw "wrong signal index";

    me._signalQueue.splice(index, 1);
    me._invalidateSignalQueueVisual();
    me._events.emit(Enums.Events.TOWER_SIGNAL_CHANGE, me);
  }

  /**
   * @param {Signal} signal
   */
  _processSignalArrived(signal) {
    const me = this;

    me._signalPool.release(signal);

    me._events.emit(Enums.Events.SCORE_INCREMENT, me);
  }

  _invalidateSignalQueueVisual() {
    const me = this;

    const signalCount = me._signalQueue.length;

    if (signalCount === 0) {
      me._signalQueueText.setText("[]");
      me._light.setVisible(false);
      return;
    }

    let text = "";
    for (const signal of me._signalQueue) {
      text += signal._labelText.text + ",";
    }
    me._signalQueueText.setText(text);

    me._light.setVisible(true);
    let lightColor = -1;
    if (signalCount >= 1 && signalCount <= 3)
      lightColor = Config.Color.TowerLight.Green;
    else if (signalCount >= 4 && signalCount <= 6)
      lightColor = Config.Color.TowerLight.Yellow;
    else if (signalCount >= 7) lightColor = Config.Color.TowerLight.Red;

    if (lightColor === -1) throw "light color error";

    const rgb = me._hexToRgb(lightColor);
    me._light.color.setTo(rgb.r, rgb.g, rgb.b);
  }

  _hexToRgb(hexColor) {
    const r = (hexColor >> 16) & 0xff;
    const g = (hexColor >> 8) & 0xff;
    const b = hexColor & 0xff;

    return { r, g, b };
  }
}
