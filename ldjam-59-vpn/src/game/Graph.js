import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Config from "./Config.js";
import Edge from "./Edge.js";
import Enums from "./Enums.js";
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

  /** @type {Number[][]} */
  _shortestPaths;

  /** @type {Number[][]} */
  _nextNodes;

  /** @type {Phaser.Events.EventEmitter} */
  _events;

  /** @type {Edge | null} */
  _edgeToRemove = null;

  constructor(signalPool, events) {
    const me = this;

    me._signalPool = signalPool;
    me._events = events;

    for (let i = 0; i < Config.Start.Towers.length; ++i) {
      const el = Config.Start.Towers[i];
      const tower = new Tower(i, el.x, el.y, i + "", me._signalPool);
      me._towers.push(tower);
    }

    me._lineDrawingGraphics = Here._.add.graphics();

    me._graphEdgesGraphics = Here._.add.graphics();

    Here._.input
      .on("pointerdown", (pointer) => {
        me._onPointerDown(pointer);
      })
      .on("pointerup", (pointer) => {
        me._onPointerUp(pointer);
      });

    me._rebuildGraph();

    // ==== DEBUG DEBUG
    for (let i = 0; i < 3; ++i) {
      me.createNewSignal();
    }
  }

  update(deltaTime) {
    const me = this;

    if (!!me._selectedTower) {
      me._drawNewEdgeLine();
    } else {
      me._selectEdgeToRemove();
    }

    me._updateSignals(deltaTime);
  }

  createNewSignal() {
    const me = this;

    const pair = Utils.getRandomElems(me._towers, 2);
    console.log(pair[0].id, pair[1].id);
    const signal = me._signalPool.create(pair[0].id, pair[1].id);

    me._towers[pair[0].id].addSignal(signal);
  }

  /**
   * @param {Number} fromTowerId
   * @param {Number} toTowerId
   * @returns {Edge}
   */
  getEdgeToSend(fromTowerId, toTowerId) {
    const me = this;

    const path = me._getPath(fromTowerId, toTowerId);
    if (!path) return null;

    if (path.length === 0) throw "same vertex!";

    const nextVertexId = path[0];
    /** @type {Edge} */
    const edge = Utils.firstOrNull(me._edges, (e) =>
      e.thisIsIt(fromTowerId, nextVertexId),
    );
    if (!edge) throw `can't find edge ${fromTowerId} ${nextVertexId}`;

    if (!edge.isFree()) return null;

    return edge;
  }

  _selectEdgeToRemove() {
    const me = this;

    me._lineDrawingGraphics.clear();

    const mouserPos = Utils.buildPoint(
      Here._.input.mousePointer.worldX,
      Here._.input.mousePointer.worldY,
    );
    /** @type {Edge} */
    me._edgeToRemove = Utils.firstOrNull(me._edges, (e) => {
      /** @type {Edge} */
      const edge = e;
      const onSegment = me._isPointOnSegment(
        edge.getFromPos(),
        edge.getToPos(),
        Config.EdgeThickness,
        mouserPos,
        Config.RemoveEdgeOffset,
      );
      return onSegment;
    });

    if (!me._edgeToRemove) return;

    me._lineDrawingGraphics.lineStyle(Config.EdgeThickness + 10, 0xff0000, 1.0);
    const from = me._edgeToRemove.getFromPos();
    const to = me._edgeToRemove.getToPos();
    me._lineDrawingGraphics.lineBetween(from.x, from.y, to.x, to.y);
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

  /**
   *
   * @param {Phaser.Input.Pointer} pointer
   * @returns
   */
  _onPointerDown(pointer) {
    const me = this;

    if (pointer.rightButtonDown()) {
      me._tryRemoveEdge(pointer);
    } else {
      me._processTowerClick(pointer);
    }
  }

  _processTowerClick(pointer) {
    const me = this;

    const clickedTower = me._getTowerOnMousePos(pointer);
    if (!clickedTower) return;

    if (!!me._selectedTower) {
      throw "selected tower already filled!";
    }

    me._selectedTower = clickedTower;
  }

  _tryRemoveEdge() {
    const me = this;

    if (!me._edgeToRemove) return;

    me._edges = me._edges.filter(
      (e) =>
        !e.thisIsIt(me._edgeToRemove.getFromId(), me._edgeToRemove.getToId()),
    );
    me._edgeToRemove.remove();
    me._events.emit(Enums.Events.EDGE_REMOVED, me._edgeToRemove);
    me._edgeToRemove = null;
    me._rebuildGraph();
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

    const edge = new Edge(fromTower, toTower, me._signalPool);
    me._edges.push(edge);

    me._rebuildGraph();
    me._events.emit(Enums.Events.EDGE_ADDED, edge);
  }

  _rebuildGraph() {
    const me = this;

    me._graphEdgesGraphics
      .clear()
      .lineStyle(Config.EdgeThickness, 0xffff00, 1.0);
    for (const edge of me._edges) {
      const fromPos = edge.getFromPos();
      const targetPos = edge.getToPos();

      me._graphEdgesGraphics.lineBetween(
        fromPos.x,
        fromPos.y,
        targetPos.x,
        targetPos.y,
      );
    }

    me._rebuildDistances();
  }

  _rebuildDistances() {
    const me = this;

    const n = this._towers.length;

    const dist = Array(n)
      .fill()
      .map(() => Array(n).fill(Infinity));
    const next = Array(n)
      .fill()
      .map(() => Array(n).fill(null));

    for (let i = 0; i < n; i++) {
      dist[i][i] = 0;
    }

    for (const edge of this._edges) {
      const fromId = edge.getFromId();
      const toId = edge.getToId();

      if (fromId < n && toId < n) {
        dist[fromId][toId] = 1;
        dist[toId][fromId] = 1;
        next[fromId][toId] = toId;
        next[toId][fromId] = fromId;
      }
    }

    for (let k = 0; k < n; k++) {
      for (let i = 0; i < n; i++) {
        if (dist[i][k] === Infinity) continue;
        for (let j = 0; j < n; j++) {
          if (dist[k][j] === Infinity) continue;

          const newDist = dist[i][k] + dist[k][j];
          if (newDist < dist[i][j]) {
            dist[i][j] = newDist;
            next[i][j] = next[i][k];
          }
        }
      }
    }

    this._shortestPaths = dist;
    this._nextNodes = next;
  }

  _getPath(fromId, toId) {
    const me = this;
    if (
      fromId < 0 ||
      fromId >= this._towers.length ||
      toId < 0 ||
      toId >= this._towers.length
    ) {
      return null;
    }

    if (this._shortestPaths[fromId][toId] === Infinity) {
      return null;
    }

    // Восстановление пути
    const path = [];
    let current = fromId;

    while (current !== toId) {
      current = this._nextNodes[current][toId];
      if (current === null) {
        return null;
      }
      path.push(current);
    }

    return path;
  }

  _isPointOnSegment(fromPos, toPos, thickness, point, offset = 0) {
    const effectiveThickness = thickness + offset;
    const halfThickness = effectiveThickness / 2;

    const segmentVec = {
      x: toPos.x - fromPos.x,
      y: toPos.y - fromPos.y,
    };

    const pointVec = {
      x: point.x - fromPos.x,
      y: point.y - fromPos.y,
    };

    const segmentLengthSq =
      segmentVec.x * segmentVec.x + segmentVec.y * segmentVec.y;

    if (segmentLengthSq === 0) {
      return Math.hypot(pointVec.x, pointVec.y) <= halfThickness;
    }

    let t =
      (pointVec.x * segmentVec.x + pointVec.y * segmentVec.y) / segmentLengthSq;

    if (t < 0 || t > 1) return false;

    const closestPoint = {
      x: fromPos.x + t * segmentVec.x,
      y: fromPos.y + t * segmentVec.y,
    };

    const distance = Math.hypot(
      point.x - closestPoint.x,
      point.y - closestPoint.y,
    );

    return distance <= halfThickness;
  }
}
