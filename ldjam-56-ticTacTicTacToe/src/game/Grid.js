import Utils from "../framework/Utils.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";

export default class Grid {
  static _cellMap = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
  ];

  static _rows = [
    [Enums.Cells.LU, Enums.Cells.U, Enums.Cells.RU],
    [Enums.Cells.L, Enums.Cells.C, Enums.Cells.R],
    [Enums.Cells.LD, Enums.Cells.D, Enums.Cells.RD],
    [Enums.Cells.LU, Enums.Cells.L, Enums.Cells.LD],
    [Enums.Cells.U, Enums.Cells.C, Enums.Cells.D],
    [Enums.Cells.RU, Enums.Cells.R, Enums.Cells.RD],
    [Enums.Cells.LU, Enums.Cells.C, Enums.Cells.RD],
    [Enums.Cells.LD, Enums.Cells.C, Enums.Cells.RU],
  ];

  static corners = [
    Enums.Cells.LU,
    Enums.Cells.RU,
    Enums.Cells.LD,
    Enums.Cells.RD,
  ];

  static middles = [Enums.Cells.U, Enums.Cells.L, Enums.Cells.R, Enums.Cells.D];

  static posToCell(mousePos) {
    const x = Math.floor(mousePos.x / Consts.Sizes.Cell);
    const y = Math.floor(mousePos.y / Consts.Sizes.Cell);

    if (x < 0 || x > 2) return -1;
    if (y < 0 || y > 2) return -1;

    return Grid._cellMap[y][x];
  }

  static cellToPos(cell) {
    const x = (cell % 3) * Consts.Sizes.Cell + Consts.Sizes.Cell / 2;
    const y = Math.floor(cell / 3) * Consts.Sizes.Cell + Consts.Sizes.Cell / 2;
    return Utils.buildPoint(x, y);
  }

  static toOppositeCorner(corner) {
    if (corner == Enums.Cells.LU) return Enums.Cells.RD;
    if (corner == Enums.Cells.RU) return Enums.Cells.LD;
    if (corner == Enums.Cells.LD) return Enums.Cells.RU;
    if (corner == Enums.Cells.RD) return Enums.Cells.LU;

    throw `not corner ${corner}`;
  }

  static toOppositeMiddle(middle) {
    if (middle == Enums.Cells.U) return Enums.Cells.D;
    if (middle == Enums.Cells.D) return Enums.Cells.U;
    if (middle == Enums.Cells.L) return Enums.Cells.R;
    if (middle == Enums.Cells.R) return Enums.Cells.L;

    throw `not middle ${middle}`;
  }

  static toOpposite(cell) {
    if (cell == Enums.Cells.C) return Enums.Cells.C;

    return Utils.contains(Grid.corners, cell)
      ? Grid.toOppositeCorner(cell)
      : Grid.toOppositeMiddle(cell);
  }

  static toClosestCorner(first, second) {
    if (first > second) {
      const t = first;
      first = second;
      second = t;
    }

    if (first == Enums.Cells.U && second == Enums.Cells.L)
      return Enums.Cells.LU;
    if (first == Enums.Cells.U && second == Enums.Cells.R)
      return Enums.Cells.RU;
    if (first == Enums.Cells.L && second == Enums.Cells.D)
      return Enums.Cells.LD;
    if (first == Enums.Cells.R && second == Enums.Cells.D)
      return Enums.Cells.RD;

    throw `wrong args to closest corners ${first}, ${second}`;
  }

  static getWinner(cells) {
    for (let i = 0; i < Grid._rows.length; ++i) {
      const row = Grid._rows[i];
      const winner = Grid._getRowWinner(cells, row[0], row[1], row[2]);
      if (winner != Enums.Side.NONE) return winner;
    }

    return Utils.all(cells, (x) => x != Enums.Side.NONE)
      ? Enums.Side.DRAW
      : Enums.Side.NONE;
  }

  static toFarestCorners(cell) {
    const me = this;
    if (cell == Enums.Cells.LU)
      return [Enums.Cells.RD, Enums.Cells.RU, Enums.Cells.LD];
    if (cell == Enums.Cells.U)
      return [Enums.Cells.LD, Enums.Cells.RD, Enums.Cells.LU, Enums.Cells.RU];
    if (cell == Enums.Cells.RU)
      return [Enums.Cells.LD, Enums.Cells.LU, Enums.Cells.RD];

    if (cell == Enums.Cells.L)
      return [Enums.Cells.RU, Enums.Cells.RD, Enums.Cells.LU, Enums.Cells.LD];
    if (cell == Enums.Cells.R)
      return [Enums.Cells.LU, Enums.Cells.LD, Enums.Cells.RU, Enums.Cells.RD];

    if (cell == Enums.Cells.LD)
      return [Enums.Cells.RU, Enums.Cells.LU, Enums.Cells.RD];
    if (cell == Enums.Cells.D)
      return [Enums.Cells.LU, Enums.Cells.RU, Enums.Cells.LD, Enums.Cells.RD];
    if (cell == Enums.Cells.RD)
      return [Enums.Cells.LU, Enums.Cells.LD, Enums.Cells.RU];

    return [];
  }

  static getCenterPos() {
    return Utils.buildPoint(1.5 * Consts.Sizes.Cell, 1.5 * Consts.Sizes.Cell);
  }

  static _getRowWinner(cells, a, b, c) {
    const sum = cells[a] + cells[b] + cells[c];
    return sum == 3
      ? Enums.Side.CROSS
      : sum == -3
      ? Enums.Side.NOUGHT
      : Enums.Side.NONE;
  }
}
