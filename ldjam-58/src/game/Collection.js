import Consts from "./Consts.js";
import Shelf from "./Shelf.js";
import Transport from "./Transport.js";

export default class Collection {
  /** @type {Shelf[]} */
  _shelfs = [];

  _positionX = 0;

  /** @type {Transport} */
  _transport;

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

  updatePos(currentPos) {
    const me = this;

    const shelfOffset = -currentPos % Consts.Shelf.Width;
    const startIndex = Math.floor(currentPos / Consts.Shelf.Width);

    for (let i = 0; i < me._shelfs.length; ++i) {
      const shelf = me._shelfs[i];
      const shelfObj = shelf.toGameObj();

      shelfObj.setPosition(shelfOffset + i * Consts.Shelf.Width, shelfObj.y);
      const nextIndex = startIndex + i;
      if (shelf.getIndex() !== nextIndex) {
        shelf.init(nextIndex);
      }
    }
  }
}
