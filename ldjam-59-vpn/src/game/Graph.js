import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Config from "./Config.js";
import Edge from "./Edge.js";
import Enums from "./Enums.js";
import SignalPool from "./SignalPool.js";
import Tower from "./Tower.js";
import TowerMenu from "./TowerMenu.js";

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

  /** @type {Boolean} */
  _isCutscene = false;

  /** @type {TowerMenu} */
  _towerMenu;

  constructor(signalPool, events) {
    const me = this;

    me._signalPool = signalPool;
    me._events = events;
    me._lineDrawingGraphics = Here._.add.graphics();
    me._graphEdgesGraphics = Here._.add.graphics();
    me._towerMenu = new TowerMenu();

    // =========
    for (let i = 0; i < Config.Start.TowersCount; ++i) {
      me.addNewTower();
    }

    for (let i = 0; i < Config.Start.Edges.length; ++i) {
      me._tryAddEdge(
        me._towers[Config.Start.Edges[i].from],
        me._towers[Config.Start.Edges[i].to],
      );
    }
    // =======

    Here._.input
      .on("pointerdown", (pointer) => {
        me._onPointerDown(pointer);
      })
      .on("pointerup", (pointer) => {
        me._onPointerUp(pointer);
      });

    events.on(Enums.Events.MOUSE_ON_TOWER, me._onMouseOnTower, me);

    me._rebuildGraph();
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

  reset() {
    const me = this;

    me._isCutscene = false;

    for (const edge of me._edges) {
      edge.remove();
    }

    for (const tower of me._towers) {
      tower.reset();
    }

    me._edges = [];
    me._rebuildGraph();
  }

  startFinalBossSequence() {
    const me = this;

    me._isCutscene = true;
    for (const edge of me._edges) {
      edge.startFinalBossSequence();
    }

    for (const tower of me._towers) {
      tower.startFinalBossSequence();
    }
  }

  trySpawnNewSignal() {
    const me = this;

    const towersWithRoom = me._towers.filter((t) => t.hasRoom());
    if (towersWithRoom.length < 2) return false;

    const pair = Utils.getRandomElems(towersWithRoom, 2);
    const signal = me._signalPool.create(pair[0].id, pair[1].id);

    me._towers[pair[0].id].addSignal(signal);
    return true;
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

    const nextTower = me._towers[nextVertexId];
    if (!nextTower.hasRoom()) return null; // TODO: multiple paths

    return edge;
  }

  /**
   * @param {Edge[]} takenEdges
   * @returns {Edge}
   */
  getEdgesToTake(takenEdges) {
    const me = this;

    const result = [];
    for (const edge of me._edges) {
      if (Utils.any(takenEdges, (e) => e.equalTo(edge))) continue;

      result.push(edge);
    }

    return result;
  }

  addNewTower() {
    const me = this;

    if (me._towers.length >= Config.TowerPositions.length) {
      return; // TODO: error
    }

    const index = me._towers.length;

    const el = Config.TowerPositions[me._towers.length];
    const tower = new Tower(
      index,
      el.x,
      el.y,
      index + "",
      me._signalPool,
      me._events,
    );
    me._towers.push(tower);

    me._rebuildDistances();
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

    if (me._isCutscene) return;

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
    me._rebuildGraph();

    me._edgeToRemove = null;
  }

  _onPointerUp(pointer) {
    const me = this;

    if (me._isCutscene) return;

    if (!me._selectedTower) {
      return;
    }

    /** @type {Tower} */
    const targetTower = me._getTowerOnMousePos(pointer);
    if (!!targetTower) {
      if (targetTower.id === me._selectedTower.id) {
        targetTower.toggleMode();
      } else {
        me._tryAddEdge(me._selectedTower, targetTower);
      }
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

  /**
   * @param {Tower} tower
   */
  _onMouseOnTower(tower) {
    const me = this;

    const towerPos = tower.getPos();

    me._towerMenu
      .toGameObj()
      .setPosition(towerPos.x, towerPos.y - 100)
      .setVisible(true);
  }
}
