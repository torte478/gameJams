import ItemConfig from "./ItemConfig.js";

export default class LevelConfig {
  /** @type {string} */
  name;

  /** @type {Phaser.Geom.Point} */
  startTilePos;

  /** @type {Phaser.Geom.Point} */
  finishTilePos;

  /** @type {Number[][]} */
  solution;

  /** @type {ItemConfig[]} */
  spikes;

  /** @type {ItemConfig[]} */
  guns;

  /** @type {ItemConfig[]} */
  trampolins;

  /** @type {ItemConfig[]} */
  goodBarrels;

  /** @type {ItemConfig[]} */
  badBarrels;
}
