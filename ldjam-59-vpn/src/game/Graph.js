import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";
import Config from "./Config.js";
import Edge from "./Edge.js";
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

  constructor() {
    const me = this;

    for (let i = 0; i < Config.Start.Towers.length; ++i) {
      const el = Config.Start.Towers[i];
      const tower = new Tower(i, el.x, el.y, i + "");
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
  }

  update() {
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

    const edge = new Edge(fromTower.id, toTower.id);
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
