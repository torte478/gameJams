import Utils from "../framework/Utils.js";
import Consts from "./Consts.js";
import Shelf from "./Shelf.js";
import Transport from "./Transport.js";

export default class Collection {
  /** @type {Shelf[]} */
  _shelfs = [];

  _positionX = 0;

  /** @type {Transport} */
  _transport;

  /** @type {Set} */
  _collectedIndexes = new Set();

  constructor() {
    const me = this;

    const capacity = 6;
    for (let i = 0; i < capacity; ++i) {
      const shelf = new Shelf();
      shelf.init(i);
      shelf.toGameObj().setPosition(i * Consts.Shelf.Width, 150);
      me._shelfs.push(shelf);
    }
  }

  updatePos(scroll, act) {
    const me = this;

    const shelfOffset = -scroll % Consts.Shelf.Width;
    const startIndex = Math.floor(scroll / Consts.Shelf.Width);

    for (let i = 0; i < me._shelfs.length; ++i) {
      const shelf = me._shelfs[i];
      const shelfObj = shelf.toGameObj();

      shelfObj.setPosition(shelfOffset + i * Consts.Shelf.Width, shelfObj.y);
      const nextIndex = startIndex + i;
      if (shelf.getIndex() !== nextIndex) {
        let isComplete = me._collectedIndexes.has(nextIndex);
        shelf.init(nextIndex, me._isComplete(nextIndex, act));
      }
    }
  }

  tryCompleteOrder(scroll, orderIndex) {
    const me = this;

    if (orderIndex === null) throw "order index is null";

    const currentShelfIndex = Math.floor(
      (scroll + Consts.Viewport.Width / 2) / Consts.Shelf.Width
    );

    const success = currentShelfIndex === orderIndex;

    if (success) {
      me._collectedIndexes.add(currentShelfIndex);
      /** @type {Shelf} */
      const shelf = Utils.firstOrNull(
        me._shelfs,
        (s) => s.getIndex() === currentShelfIndex
      );
      shelf.complete();
    }

    return success;
  }

  isCurrentShelfCorrectForOrderIFE(scroll, orderIndex) {
    const me = this;

    if (orderIndex === null) throw "order index is null";

    const currentShelfIndex = Math.floor(
      (scroll + Consts.Viewport.Width / 2) / Consts.Shelf.Width
    );

    return currentShelfIndex === orderIndex;
  }

  _isComplete(shelfIndex, act) {
    const me = this;

    if (me._collectedIndexes.has(shelfIndex)) return true;

    if (act >= 2 && shelfIndex % 11 === 0) {
      return true;
    }

    if (
      act >= 3 &&
      (shelfIndex % 7 === 0 || shelfIndex % 4 === 0 || shelfIndex % 13 === 0)
    ) {
      return true;
    }

    if (act >= 4) {
      return shelfIndex < 8031810176 - 1;
    }

    return false;
  }
}
