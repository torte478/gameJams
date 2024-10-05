import Utils from "../framework/Utils.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";

export default class Grid {
  static cellMap = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
  ];

  static posToCell(mousePos) {
    const x = Math.floor(mousePos.x / Consts.Sizes.Cell);
    const y = Math.floor(mousePos.y / Consts.Sizes.Cell);

    if (x < 0 || x > 2) return -1;
    if (y < 0 || y > 2) return -1;

    return Grid.cellMap[y][x];
  }

  static cellToPos(cell) {
    const x = (cell % 3) * Consts.Sizes.Cell + Consts.Sizes.Cell / 2;
    const y = Math.floor(cell / 3) * Consts.Sizes.Cell + Consts.Sizes.Cell / 2;
    return Utils.buildPoint(x, y);
  }
}
