import ItemConfig from "./ItemConfig.js";

export default class LevelConfig {
  /** @type {string} */
  name;

  /** @type {Phaser.Geom.Point} */
  startTilePos;

  /** @type {Number[][]} */
  solution;

  /** @type {ItemConfig[]} */
  spikes;
}
