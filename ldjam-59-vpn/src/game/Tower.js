import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Config from "./Config.js";
import Enums from "./Enums.js";
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

    me._sprite = Here._.add.sprite(0, 0, "tower", 0);

    const labelText = Here._.add.text(0, 26, label, { fontSize: 20 });
    me._signalQueueText = Here._.add.text(50, 0, "[]", { fontSize: 20 });
    me._container = Here._.add.container(x, y, [
      me._sprite,
      labelText,
      me._signalQueueText,
    ]);

    me._container
      .setSize(me._sprite.width, me._sprite.height)
      .setInteractive()
      .on("pointerover", () => {
        me._sprite.setTint(0x44ff44);
      })
      .on("pointerout", () => {
        me._sprite.clearTint();
      });
  }

  toGameObj() {
    const me = this;

    return me._container;
  }

  getPos() {
    const me = this;

    return Utils.toPoint(me._container);
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
    me._invalidateSignalQueueText();
  }

  /**
   * @param {Graph} graph
   * @returns
   */
  updateSignals(graph) {
    const me = this;

    if (me._signalQueue.length === 0) {
      return;
    }

    const signalsToDelete = [];
    for (const signal of me._signalQueue) {
      const edgeToSend = graph.getEdgeToSend(me.id, signal.toTowerId);
      if (!edgeToSend) continue;

      signalsToDelete.push(signal.uid);
      edgeToSend.sendSignal(me.id, signal);
    }

    if (signalsToDelete.length > 0) {
      me._signalQueue = me._signalQueue.filter(
        (s) => !Utils.contains(signalsToDelete, s.uid),
      );
      me._invalidateSignalQueueText();
    }
  }

  hasRoom() {
    const me = this;

    return me._signalQueue.length < Config.MaxSignalPerTower;
  }

  startFinalBossSequence() {
    const me = this;

    me._sprite.play("tower_transform");
  }

  /**
   * @param {Signal} signal
   */
  _processSignalArrived(signal) {
    const me = this;

    me._signalPool.release(signal);

    me._events.emit(Enums.Events.SCORE_INCREMENT);
  }

  _invalidateSignalQueueText() {
    const me = this;

    if (me._signalQueue.length === 0) {
      me._signalQueueText.setText("[]");
      return;
    }

    let text = "";
    for (const signal of me._signalQueue) {
      text += signal._labelText.text + ",";
    }
    me._signalQueueText.setText(text);
  }
}
