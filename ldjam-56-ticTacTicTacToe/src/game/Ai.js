import Phaser from "../lib/phaser.js";

import Here from "../framework/Here.js";
import Utils from "../framework/Utils.js";

import Config from "./Config.js";
import Consts from "./Consts.js";
import Enums from "./Enums.js";
import Grid from "./Grid.js";
import Chunk from "./Chunk.js";

export default class Ai {
  /** @type {Number} */
  _difficulty;

  constructor(difficulty) {
    const me = this;

    me._difficulty = difficulty;
  }

  /**
   * @param {Chunk} chunk
   * @returns {Number}
   */
  makeStep(chunk) {
    const me = this;

    const availableSteps = chunk.getAvailableSteps();
    if (availableSteps.length == 0) throw "no available steps";

    const winSteps = Array.from(me._getWinSteps(chunk, availableSteps));

    Utils.debugLog(winSteps);

    if (winSteps.length == 0 || winSteps.length == availableSteps.length)
      return Utils.getRandomEl(availableSteps, 0);

    const winProbability =
      me._difficulty == Enums.Difficulty.HARD
        ? 1
        : me._difficulty == Enums.Difficulty.NORMAL
        ? 2
        : 4;
    const isWinStep = Utils.getRandom(1, winProbability) == 1;

    const result = isWinStep
      ? Utils.getRandomEl(winSteps, 0)
      : Utils.getRandomEl(Utils.except(availableSteps, winSteps), 0);

    if (!chunk.isFree(result)) throw `AI is broken!`;

    return result;
  }

  /**
   * @param {Chunk} chunk
   * @param {Number[]} availableSteps
   * @returns {Set}
   */
  _getWinSteps(chunk, availableSteps) {
    const me = this;
    const res = new Set();

    // rule 1
    for (let i = 0; i < availableSteps.length; ++i)
      if (me._isInstantWinStep(chunk, availableSteps[i], Enums.Side.NOUGHT))
        res.add(availableSteps[i]);

    if (res.size > 0) return res;

    // rule 2
    for (let i = 0; i < availableSteps.length; ++i)
      if (me._isInstantWinStep(chunk, availableSteps[i], Enums.Side.CROSS))
        res.add(availableSteps[i]);

    if (res.size > 0) return res;

    const firstStepIsCross =
      chunk.stepHistory.length > 0 &&
      chunk.stepHistory[0].side == Enums.Side.CROSS;
    return firstStepIsCross
      ? me._getWinStepsIfFirstStepIsCross(chunk, availableSteps)
      : me._getWinStepsIfFirstStepIsNought(chunk, availableSteps);
  }

  _getWinStepsIfFirstStepIsCross(chunk, availableSteps) {
    const me = this;
    const res = new Set();

    // first cross step == center
    if (
      chunk.stepHistory.length > 0 &&
      chunk.stepHistory[0].cell == Enums.Cells.C
    ) {
      const freeCorners = chunk.filterFree(Grid.corners);

      if (freeCorners.length > 0) {
        for (let i = 0; i < freeCorners.length; ++i) res.add(freeCorners[i]);
        return res;
      } else {
        const freeMiddles = chunk.filterFree(Grid.middles);
        for (let i = 0; i < freeMiddles.length; ++i) res.add(freeMiddles[i]);
        return res;
      }
    }

    // first cross step == corner
    if (Utils.contains(Grid.corners, chunk.stepHistory[0].cell)) {
      if (chunk.isFree(Enums.Cells.C)) {
        res.add(Enums.Cells.C);
        return res;
      }

      const oppositeCorner = Grid.toOppositeCorner(chunk.stepHistory[0].cell);
      if (chunk.isFree(oppositeCorner)) {
        res.add(oppositeCorner);
        return res;
      }

      if (chunk.stepHistory.length == 3) {
        const freeMiddles = chunk.filterFree(Grid.middles);
        for (let i = 0; i < freeMiddles.length; ++i) res.add(freeMiddles[i]);
        return res;
      }

      return new Set(availableSteps);
    }

    //first cross step == middle
    if (chunk.isFree(Enums.Cells.C)) {
      res.add(Enums.Cells.C);
      return res;
    }

    if (chunk.stepHistory.length != 3) return new Set(availableSteps);

    const firstCrossStep = chunk.stepHistory[0].cell;
    const secondCrossStep = chunk.stepHistory[2].cell;
    if (Utils.contains(Grid.corners, secondCrossStep)) {
      res.add(Grid.toOppositeCorner(secondCrossStep));
      return res;
    } else if (secondCrossStep == Grid.toOppositeMiddle(firstCrossStep)) {
      const freeCorners = chunk.filterFree(Grid.corners);
      for (let i = 0; i < freeCorners.length; ++i) res.add(freeCorners[i]);
      return res;
    } else {
      const closestCorner = Grid.toClosestCorner(
        firstCrossStep,
        secondCrossStep
      );
      res.add(closestCorner);
      return res;
    }
  }

  /**
   * @param {Chunk} chunk
   * @param {Number[]} availableSteps
   * @returns {Set}
   */
  _getWinStepsIfFirstStepIsNought(chunk, availableSteps) {
    const me = this;

    const res = new Set();
    // first step
    if (chunk.stepHistory.length == 0) {
      res.add(Enums.Cells.C);
      return res;
    }

    // has free corner
    const lastEnemyStep = chunk.stepHistory[chunk.stepHistory.length - 1].cell;
    const farestCorners = Grid.toFarestCorners(lastEnemyStep);
    const freeCorners = chunk.filterFree(farestCorners);
    for (let i = 0; i < freeCorners.length; ++i) {
      res.add(freeCorners[i]);
      return res;
    }

    // hasn't free corner
    return new Set(availableSteps);
  }

  _isInstantWinStep(chunk, cell, side) {
    const me = this;

    const cells = chunk.toAssumption(cell, side);
    return Grid.getWinner(cells) == side;
  }
}
