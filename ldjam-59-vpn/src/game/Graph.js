import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Config from "./Config.js";
import Edge from "./Edge.js";
import SignalPool from "./SignalPool.js";
import Tower from "./Tower.js";

export default class Graph {
  /** @type {Tower[]} */
  _towers = [];

  /** @type {Tower | null} */
  _selectedTower = null;

  /** @type {Phaser.GameObjects.Graphics} */
  _lineDrawingGraphics;

  /** @type {Phaser.GameObjects.Graphics} */
  _graphEdgesGraphics;

  /** @type {Edge[]} */
  _edges = [];

  /** @type {SignalPool} */
  _signalPool;

  constructor(signalPool) {
    const me = this;

    me._signalPool = signalPool;

    for (let i = 0; i < Config.Start.Towers.length; ++i) {
      const el = Config.Start.Towers[i];
      const tower = new Tower(i, el.x, el.y, i + "", me._signalPool);
      me._towers.push(tower);
    }

    me._lineDrawingGraphics = Here._.add
      .graphics()
      .lineStyle(10, 0xffff00, 1.0);

    me._graphEdgesGraphics = Here._.add.graphics().lineStyle(10, 0xffff00, 1.0);

    Here._.input
      .on("pointerdown", (pointer) => {
        me._onPointerDown(pointer);
      })
      .on("pointerup", (pointer) => {
        me._onPointerUp(pointer);
      });

    for (let i = 0; i < 3; ++i) {
      me.createNewSignal();
    }
  }

  update(deltaTime) {
    const me = this;

    me._drawNewEdgeLine();
    me._updateSignals(deltaTime);
  }

  createNewSignal() {
    const me = this;

    const path = Utils.getRandomElems(me._towers, 2);
    const signal = me._signalPool.create(path[0].id, path[1].id);

    me._towers[path[0].id].addSignal(signal);
  }

  /**
   * @param {Number} fromTowerId
   * @param {Number} toTowerId
   * @returns {Edge}
   */
  getEdgeToSend(fromTowerId, toTowerId) {
    const me = this;

    return Utils.firstOrNull(
      me._edges,
      (e) => e.thisIsIt(fromTowerId, toTowerId) && e.isFree(),
    );
  }

  _updateSignals(deltaTime) {
    const me = this;

    for (const edge of me._edges) {
      edge.updateSignals(deltaTime);
    }

    for (const tower of me._towers) {
      tower.updateSignals(me);
    }
  }

  _drawNewEdgeLine() {
    const me = this;

    if (!me._selectedTower) {
      return;
    }

    const fromPos = Utils.toPoint(me._selectedTower.toGameObj());

    me._lineDrawingGraphics
      .clear()
      .lineBetween(
        fromPos.x,
        fromPos.y,
        Here._.input.mousePointer.worldX,
        Here._.input.mousePointer.worldY,
      );
  }

  _getTowerOnMousePos(pointer) {
    const me = this;

    const pos = new Phaser.Math.Vector2(pointer.x, pointer.y);
    return Utils.firstOrNull(me._towers, (t) => t.containsPoint(pos));
  }

  _onPointerDown(pointer) {
    const me = this;

    const clickedTower = me._getTowerOnMousePos(pointer);
    if (!clickedTower) return;

    if (!!me._selectedTower) {
      throw "selected tower already filled!";
    }

    me._selectedTower = clickedTower;
  }

  _onPointerUp(pointer) {
    const me = this;

    if (!me._selectedTower) {
      return;
    }

    const targetTower = me._getTowerOnMousePos(pointer);
    if (!!targetTower) {
      me._tryAddEdge(me._selectedTower, targetTower);
    }

    me._selectedTower = null;
    me._lineDrawingGraphics.clear();
  }

  /**
   * @param {Tower} fromTower
   * @param {Tower} toTower
   */
  _tryAddEdge(fromTower, toTower) {
    const me = this;

    const alreadyExists = Utils.any(me._edges, (e) =>
      e.thisIsIt(fromTower.id, toTower.id),
    );
    if (alreadyExists) return;

    const edge = new Edge(fromTower, toTower);
    me._edges.push(edge);

    const fromPos = Utils.toPoint(fromTower.toGameObj());
    const targetPos = Utils.toPoint(toTower.toGameObj());

    me._graphEdgesGraphics.lineBetween(
      fromPos.x,
      fromPos.y,
      targetPos.x,
      targetPos.y,
    );

    console.log("new edge!!!");
  }
}
