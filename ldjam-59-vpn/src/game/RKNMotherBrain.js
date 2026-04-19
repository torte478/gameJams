import Utils from "../framework/Utils.js";
import Config from "./Config.js";
import Game from "./Game.js";
import Graph from "./Graph.js";
import RKN from "./RKN.js";
import VFX from "./VFX.js";

export default class RKNMotherBrain {
  /** @type {RKN[]} */
  _enemies = [];

  /** @type {Graph} */
  _graph;

  /** @type {VFX} */
  _vfx;

  constructor(graph, vfx) {
    const me = this;

    me._graph = graph;
    me._vfx = vfx;

    // for (let i = 0; i < Config.Start.RKN; ++i) {
    //   me._enemies.push(new RKN(150, 150));
    // }
  }

  update() {
    const me = this;

    for (const enemy of me._enemies) {
      enemy.update();
    }
  }

  /**
   * @param {Edge} edge
   */
  onEdgeAdded(edge) {
    const me = this;

    const enimeiesWithoutTargets = me._enemies.filter((e) => !e._targetEdge);

    if (enimeiesWithoutTargets.length > 0) {
      enimeiesWithoutTargets[0].setTarget(edge);
    }
  }

  /**
   * @param {Edge[]} sortedEdges
   */
  processNextEdgeRating(sortedEdges) {
    const me = this;

    let enemyIndex = me._enemies.length - 1;
    for (let i = 0; i < me._enemies.length; ++i) {
      if (i >= sortedEdges.length || enemyIndex < 0) return;

      const edge = sortedEdges[i];
      const edgeTaken = Utils.any(
        me._enemies,
        (e) => !!e._targetEdge && e._targetEdge.equalTo(edge),
      );
      if (!edgeTaken) {
        me._enemies[enemyIndex].setTarget(edge);
        enemyIndex -= 1;
      }
    }
  }

  /**
   * @param {Edge} edge
   */
  onEdgeRemoved(edge) {
    const me = this;

    for (const enemy of me._enemies) {
      enemy.checkEdgeRemove(edge);
    }

    const enimeiesWithoutTargets = me._enemies.filter((e) => !e._targetEdge);
    if (enimeiesWithoutTargets.length === 0) return;

    const takenEdges = me._enemies
      .filter((e) => !!e._targetEdge)
      .map((e) => e._targetEdge);
    const edgesToTake = me._graph.getEdgesToTake(takenEdges);

    for (let i = 0; i < enimeiesWithoutTargets.length; ++i) {
      if (i >= edgesToTake.length) break;

      enimeiesWithoutTargets[i].setTarget(edgesToTake[i]);
    }
  }

  spawnFirstEnemy() {
    const me = this;

    const enemy = new RKN(650, 850, me._vfx);
    me._enemies.push(enemy);

    const edges = Game.instance._graph._edges;
    if (edges.length === 0) return;

    const target = Utils.getRandomEl(edges);
    enemy.setTarget(target);
  }
}
