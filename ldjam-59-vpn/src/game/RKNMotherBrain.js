import Graph from "./Graph.js";
import RKN from "./RKN.js";

export default class RKNMotherBrain {
  /** @type {RKN[]} */
  _enemies = [];

  /** @type {Graph} */
  _graph;

  constructor(graph) {
    const me = this;

    me._graph = graph;

    me._enemies.push(new RKN(150, 150));
    me._enemies.push(new RKN(200, 200));
    me._enemies.push(new RKN(250, 250));
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
}
