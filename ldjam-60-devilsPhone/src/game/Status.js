import LevelInfo from "./LevelInfo.js";

export default class Status {
  /** @type {Number} */
  state;

  /** @type {Number | null} */
  levelIndex = null;

  /** @type {LevelInfo | null} */
  levelInfo = null;

  /** @type {Set<string>} */
  solvedLevels = new Set();
}
